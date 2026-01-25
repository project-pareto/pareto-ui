import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useAIPrompt } from "../../context/AIPromptContext";

interface AIPromptDialogProps {
  open: boolean;
  onClose: () => void;
  scenarioId: string | number | null | undefined;
  scenarioName?: string;
}

export default function AIPromptDialog(props: AIPromptDialogProps): JSX.Element {
  const { open, onClose, scenarioId, scenarioName } = props;
  const { status, isRunning, response, error, runPrompt } = useAIPrompt();
  const [prompt, setPrompt] = useState("");
  const [promptError, setPromptError] = useState<string | null>(null);

  const statusLabel = useMemo(() => {
    if (status === "running") return "Running";
    if (status === "success") return "Completed";
    if (status === "error") return "Needs Review";
    return "Ready";
  }, [status]);

  const handleSubmit = async (): Promise<void> => {
    const trimmed = prompt.trim();
    if (!trimmed || !scenarioId) {
      setPromptError("Please add a prompt first.");
      return;
    }
    setPromptError(null);
    await runPrompt(scenarioId, trimmed);
  };

  const handleClose = (): void => {
    onClose();
  };

  const responsePreview = response ? JSON.stringify(response, null, 2) : null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: "1px solid rgba(1, 103, 143, 0.15)",
          boxShadow: "0 22px 60px rgba(0,0,0,0.18)",
          background: "linear-gradient(160deg, #ffffff 0%, #f6f9fb 100%)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              AI Scenario Assistant
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Describe what to fill or adjust in {scenarioName || "this scenario"}.
            </Typography>
          </Box>
          <Chip
            icon={<AutoAwesomeIcon fontSize="small" />}
            label={statusLabel}
            color={status === "error" ? "warning" : "primary"}
            variant={status === "running" ? "filled" : "outlined"}
          />
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <TextField
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Example: Fill missing pipeline costs using distance assumptions and set all reuse options to 10% capacity."
          multiline
          minRows={4}
          fullWidth
          error={Boolean(promptError)}
          helperText={promptError || "Your prompt will drive an AI assistant to populate incomplete inputs."}
          disabled={isRunning}
          sx={{ mt: 1 }}
        />
        {isRunning && (
          <Box sx={{ mt: 3 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              Working on your request. You can close this dialog and keep working while it runs.
            </Typography>
          </Box>
        )}
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        {responsePreview && (
          <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: "rgba(1, 103, 143, 0.08)" }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Latest Response
            </Typography>
            <Typography
              component="pre"
              sx={{ margin: 0, fontSize: "0.75rem", whiteSpace: "pre-wrap", color: "text.secondary" }}
            >
              {responsePreview}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} color="secondary" variant="outlined">
          Close
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<AutoAwesomeIcon />}
          disabled={isRunning || !scenarioId}
        >
          Run AI Fill
        </Button>
      </DialogActions>
    </Dialog>
  );
}
