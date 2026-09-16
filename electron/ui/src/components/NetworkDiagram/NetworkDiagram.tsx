import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Grid, Button, IconButton, LinearProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FileUploader } from 'react-drag-drop-files';
import { fetchDiagram, uploadDiagram, deleteDiagram } from '../../services/app.service';
import NetworkMap from '../NetworkMap/NetworkMap';
import { useApp } from '../../AppContext';
import type { NetworkDiagramProps } from '../../types';

export default function NetworkDiagram(props: NetworkDiagramProps): JSX.Element {
  const { port } = useApp();
  const { scenario, type = 'input' } = props;
  if (scenario.data_input.map_data) {
    return (
      <NetworkMap
        map_data={scenario.data_input.map_data}
        showMapTypeToggle
        interactive
        width={100}
        height={75}
        {...props}
      />
    );
  }
  // A different scenario/type owns fresh state; late requests cannot affect it.
  return (
    <DiagramImage
      key={`${port}:${scenario.id}:${type}:${scenario[`${type}DiagramExtension`] ?? ''}`}
      {...props}
    />
  );
}

function DiagramImage({
  scenario,
  type = 'input',
  syncScenarioData,
}: NetworkDiagramProps): JSX.Element {
  const { port } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [diagramImage, setDiagramImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [retryLoad, setRetryLoad] = useState(false);
  const mounted = useRef(false);
  const pending = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setRetryLoad(false);
    fetchDiagram(port, type, scenario.id, controller.signal)
      .then((image) => {
        if (!controller.signal.aborted) setDiagramImage(image);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setError(error instanceof Error ? error.message : 'Unable to load diagram.');
          setRetryLoad(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [port, type, scenario.id, refresh]);

  const handleDelete = async () => {
    if (pending.current || loading) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    try {
      await deleteDiagram(port, type, scenario.id);
      if (mounted.current) {
        setDiagramImage(null);
        setFile(null);
      }
    } catch (error) {
      if (mounted.current) {
        setError(error instanceof Error ? error.message : 'Unable to delete diagram.');
        setRetryLoad(true);
      }
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (pending.current || loading) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    setFile(file);
    const data = new FormData();
    data.append('file', file, file.name);
    try {
      await uploadDiagram(port, data, type, scenario.id);
      if (!mounted.current) return;
      const image = await fetchDiagram(port, type, scenario.id);
      if (!mounted.current) return;
      if (!image) throw new Error('The uploaded diagram could not be found. Try reloading it.');
      setDiagramImage(image);
      syncScenarioData?.();
    } catch (error) {
      if (mounted.current) {
        setError(error instanceof Error ? error.message : 'Unable to upload diagram.');
        // The write may have succeeded even when its acknowledgement was lost.
        setRetryLoad(true);
      }
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert
          severity="error"
          action={
            retryLoad && (
              <Button disabled={busy || loading} onClick={() => setRefresh((value) => value + 1)}>
                Reload diagram
              </Button>
            )
          }
        >
          {error}
        </Alert>
      )}
      {(loading || busy) && <LinearProgress aria-label="Loading diagram" />}
      {diagramImage ? (
        <Grid container>
          <Grid item xs={0.5}>
            <IconButton
              aria-label="Delete diagram"
              onClick={handleDelete}
              disabled={busy || loading}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
          <Grid item xs={11.5}>
            <img alt="network diagram" style={{ width: '100%' }} src={`file://${diagramImage}`} />
          </Grid>
        </Grid>
      ) : (
        <FileUploader
          name="file"
          types={['png', 'jpg', 'jpeg']}
          disabled={busy || loading}
          handleChange={handleUpload}
          onTypeError={() => setError('Please choose a valid image file (png, jpg, jpeg).')}
        >
          <Box
            sx={{
              border: '2px dashed black',
              borderRadius: 2,
              p: 10,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <h2 style={{ color: '#9B9B9B' }}>Drag and Drop Network Diagram File</h2>
            <h2 style={{ color: '#9B9B9B' }}>or</h2>
            <Button disabled={busy || loading} style={{ color: '#0884b4' }} variant="outlined">
              Browse...
            </Button>
            <p>{file?.name ?? ''}</p>
          </Box>
        </FileUploader>
      )}
    </Box>
  );
}
