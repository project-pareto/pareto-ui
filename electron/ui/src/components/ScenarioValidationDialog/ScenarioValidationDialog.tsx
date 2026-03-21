import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  CircularProgress,
  Box,
  Divider
} from '@mui/material';
import type { ScenarioValidation } from '../../types';

interface ValidationResult extends ScenarioValidation {}

interface ScenarioValidationDialogProps {
  open: boolean;
  loading: boolean;
  advancing?: boolean;
  error: string | null;
  result: ValidationResult | null;
  onAdvance?: () => void;
  onSelectTable?: (tableName: string) => void;
  onClose: () => void;
}

export default function ScenarioValidationDialog(props: ScenarioValidationDialogProps): JSX.Element {
  const { open, loading, advancing = false, error, result, onAdvance, onSelectTable, onClose } = props;
  const missingTables = result?.missing_tables ?? [];
  const tablesWithIssues = result?.tables_with_issues ?? [];
  const isValid = Boolean(result?.valid);
  const checkMissingTablesPassed = result?.check_for_missing_tables;
  const checkMinimumRequiredPassed = result?.check_for_minimum_required_tables;
  const checkInfeasibilityPassed = result?.check_for_infeasibility;

  const checkTwoDidNotRun = checkMissingTablesPassed === false;
  const checkThreeDidNotRun = checkTwoDidNotRun || checkMinimumRequiredPassed === false;

  type CheckState = 'passed' | 'failed' | 'not_run';
  const getCheckState = (passed: boolean | undefined, didNotRun: boolean): CheckState => {
    if (didNotRun) {
      return 'not_run';
    }
    if (passed === true) {
      return 'passed';
    }
    if (passed === false) {
      return 'failed';
    }
    return 'not_run';
  };

  const checkOneState = getCheckState(checkMissingTablesPassed, false);
  const checkTwoState = getCheckState(checkMinimumRequiredPassed, checkTwoDidNotRun);
  const checkThreeState = getCheckState(checkInfeasibilityPassed, checkThreeDidNotRun);

  const getStateLabel = (state: CheckState): string => {
    if (state === 'passed') return 'Passed';
    if (state === 'failed') return 'Failed';
    return 'Not run';
  };

  const getStateColor = (state: CheckState): string => {
    if (state === 'passed') return 'success.main';
    if (state === 'failed') return 'error.main';
    return 'text.secondary';
  };

  const renderTableList = (tables: string[]): JSX.Element => {
    if (tables.length === 0) {
      return <Typography variant="body2">No tables were returned.</Typography>;
    }
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {tables.map((table) => (
          <Button
            key={table}
            variant="outlined"
            size="small"
            color="error"
            onClick={() => onSelectTable?.(table)}
          >
            {table}
          </Button>
        ))}
      </Box>
    );
  };

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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2">1. Check for Missing Tables</Typography>
              <Typography variant="subtitle2" sx={{ color: getStateColor(checkOneState) }}>
                {getStateLabel(checkOneState)}
              </Typography>
            </Box>
            {checkOneState === 'failed' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Missing tables:
                </Typography>
                {renderTableList(missingTables)}
              </Box>
            )}

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2">2. Check for Minimum Required Tables</Typography>
              <Typography variant="subtitle2" sx={{ color: getStateColor(checkTwoState) }}>
                {getStateLabel(checkTwoState)}
              </Typography>
            </Box>
            {checkTwoState === 'failed' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Tables with issues:
                </Typography>
                {renderTableList(tablesWithIssues)}
              </Box>
            )}

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2">3. Check for Infeasibility</Typography>
              <Typography variant="subtitle2" sx={{ color: getStateColor(checkThreeState) }}>
                {getStateLabel(checkThreeState)}
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        {!loading && !error && isValid && (
          <Button
            onClick={onAdvance}
            variant="contained"
            disabled={advancing}
          >
            Advance to Optimization Setup
          </Button>
        )}
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
