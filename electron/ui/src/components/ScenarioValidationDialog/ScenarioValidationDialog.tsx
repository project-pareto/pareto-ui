import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box
} from '@mui/material';

interface ValidationResult {
  valid?: boolean;
  tables_with_issues?: string[];
  error?: string;
  detail?: string;
}

interface ScenarioValidationDialogProps {
  open: boolean;
  loading: boolean;
  error: string | null;
  result: ValidationResult | null;
  onClose: () => void;
}

export default function ScenarioValidationDialog(props: ScenarioValidationDialogProps): JSX.Element {
  const { open, loading, error, result, onClose } = props;
  const tables = result?.tables_with_issues ?? [];
  const isValid = Boolean(result?.valid);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Scenario Validation</DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Validating scenario...</Typography>
          </Box>
        )}
        {!loading && error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
        {!loading && !error && result && (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {isValid
                ? "Scenario looks ready to optimize."
                : "Scenario requires more input before optimization."}
            </Typography>
            {!isValid && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Tables with missing or invalid data:
                </Typography>
                {tables.length === 0 ? (
                  <Typography variant="body2">No tables were returned.</Typography>
                ) : (
                  <List dense>
                    {tables.map((table) => (
                      <ListItem key={table} sx={{ py: 0 }}>
                        <ListItemText primary={table} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
