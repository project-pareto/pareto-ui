import {useState} from 'react';
import { Button, Modal, TextField, Box, Typography, IconButton, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const NodeTypes = {
  TreatmentSite: 'R',
  ProductionPad: 'PP',
  CompletionPad: 'CP',
  DisposalSite: 'K',
  StorageSite: 'S',
  NetworkNode: 'N',
  ReuseOption: 'O'
};

export default function NetworkNodePopup(props) {
    const { node, open, handleClose, handleSave } = props;

    const [nodeData, setNodeData] = useState({...node})

    const styles = {
        modalStyle: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 700,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
        },
    }

    const handleChange = (key, val) => {
        setNodeData(prev => 
            ({
                ...prev,
                [key]: val
            })
        )
    }

    return (
    <Modal open={open} onClose={handleClose}>
        <Box sx={styles.modalStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Node {node?.name}</Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
            <TextField
                label="Name"
                fullWidth
                margin="normal"
                value={nodeData.name}
                onChange={(e) => handleChange('name', e.target.value)}
            />
            <TextField
                label="Node Type"
                fullWidth
                margin="normal"
                select
                value={nodeData.nodeType}
                onChange={(e) => handleChange('nodeType', e.target.value)}
                >
                {Object.entries(NodeTypes).map(([name, key]) => (
                    <MenuItem key={key} value={name}>
                    {name}
                    </MenuItem>
                ))}
            </TextField>
            <CoordinatesInput 
                coordinates={[...nodeData.coordinates].reverse()}
                onChange={handleChange}
            />

            <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button variant="outlined" onClick={handleClose} sx={{ mr: 1 }}>
                Close
            </Button>
            <Button variant="contained" onClick={handleSave}>
                Save Changes
            </Button>
            </Box>
        </Box>
    </Modal>
    );
}

function CoordinatesInput({ coordinates, onChange }) {
  // coordinates: [lat, long]

  const handleLatChange = (event) => {
    const newLat = event.target.value;
    onChange("coordinates", [coordinates[1], newLat]);
  };

  const handleLongChange = (event) => {
    const newLong = event.target.value;
    onChange("coordinates", [newLong, coordinates[0]]);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <TextField
        label="Latitude"
        value={coordinates[0] ?? ''}
        onChange={handleLatChange}
        type="number"
        variant="outlined"
        fullWidth
      />
      <TextField
        label="Longitude"
        value={coordinates[1] ?? ''}
        onChange={handleLongChange}
        type="number"
        variant="outlined"
        fullWidth
      />
    </Box>
  );
}
