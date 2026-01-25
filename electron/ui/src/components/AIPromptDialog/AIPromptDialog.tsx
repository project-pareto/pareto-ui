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
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useAIPrompt } from "../../context/AIPromptContext";
import { useScenario } from "../../context/ScenarioContext";

interface AIPromptDialogProps {
  open: boolean;
  onClose: () => void;
  scenarioId: string | number | null | undefined;
  scenarioName?: string;
}

export default function AIPromptDialog(props: AIPromptDialogProps): JSX.Element {
  const { open, onClose, scenarioId, scenarioName } = props;
  const { status, isRunning, updatedScenario, updateNotes, errorMessage, runPrompt, clearResult } = useAIPrompt();
  const { scenarioData, handleScenarioUpdate } = useScenario();
  const [prompt, setPrompt] = useState("");
  const [promptError, setPromptError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"notes" | "diff">("notes");
  const aiDataInput = useMemo(() => {
    if (!updatedScenario) return null;
    return (updatedScenario as any).data_input ? (updatedScenario as any).data_input : updatedScenario;
  }, [updatedScenario]);

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

  const handleSaveUpdates = (): void => {
    if (!scenarioData || !updatedScenario) return;
    const mergedScenario = {
      ...scenarioData,
      data_input: {
        ...scenarioData.data_input,
        ...aiDataInput,
      },
    };
    handleScenarioUpdate(mergedScenario, false, false);
  };

  const handleClearPrompt = (): void => {
    clearResult();
    setPrompt("");
    setPromptError(null);
    setViewMode("notes");
  };

  const handleClose = (): void => {
    onClose();
  };

  const hasUpdates = updateNotes.length > 0;
  const showSuccessPanel = status === "success";
  const sanitizedUpdateNotes = useMemo(() => {
    const stripPrefix = (note: string): string =>
      note
        .replace(/df_parameters\[['"]([^'"]+)['"]\]/g, "$1")
        .replace(/df_parameters\./g, "");
    return updateNotes.map(stripPrefix);
  }, [updateNotes]);
  const diffTables = useMemo(() => {
    if (!scenarioData || !aiDataInput) return [];
    const currentTables = scenarioData.data_input?.df_parameters || {};
    const nextTables = (aiDataInput as any).df_parameters || {};
    const tableKeys = new Set<string>([...Object.keys(currentTables), ...Object.keys(nextTables)]);
    const tableDiffs: Array<{
      key: string;
      columns: string[];
      rows: Array<{ index: number; cells: any[]; changed: boolean[] }>;
      totalChangedRows: number;
      hasMoreRows: boolean;
      nonTabular: boolean;
    }> = [];

      const formatCell = (value: any): string => {
        if (value === "" || value === null || value === undefined) return "—";
        if (typeof value === "object") return "…";
        return String(value);
      };

    tableKeys.forEach((tableKey) => {
      const prevTable = currentTables[tableKey] || {};
      const nextTable = nextTables[tableKey] || {};
      if (JSON.stringify(prevTable) === JSON.stringify(nextTable)) return;

      const columnKeys = Array.from(
        new Set<string>([...Object.keys(prevTable || {}), ...Object.keys(nextTable || {})])
      );
      const nonTabular = columnKeys.some((key) => {
        const prevVal = (prevTable as any)[key];
        const nextVal = (nextTable as any)[key];
        const testVal = nextVal !== undefined ? nextVal : prevVal;
        return testVal !== undefined && !Array.isArray(testVal);
      });

      if (nonTabular) {
        tableDiffs.push({
          key: tableKey,
          columns: [],
          rows: [],
          totalChangedRows: 0,
          hasMoreRows: false,
          nonTabular: true,
        });
        return;
      }

      const maxRows = Math.max(
        ...columnKeys.map((key) => {
          const prevVal = (prevTable as any)[key] || [];
          const nextVal = (nextTable as any)[key] || [];
          return Math.max(prevVal.length || 0, nextVal.length || 0);
        }),
        0
      );

      const changedRows: Array<{ index: number; cells: any[]; changed: boolean[] }> = [];
      for (let rowIndex = 0; rowIndex < maxRows; rowIndex += 1) {
        let rowChanged = false;
        const cells = columnKeys.map((key) => {
          const nextVal = (nextTable as any)[key] || [];
          return nextVal[rowIndex];
        });
        const changed = columnKeys.map((key, idx) => {
          const prevVal = (prevTable as any)[key] || [];
          const nextVal = (nextTable as any)[key] || [];
          const prevCell = prevVal[rowIndex];
          const nextCell = nextVal[rowIndex];
          const cellChanged = JSON.stringify(prevCell) !== JSON.stringify(nextCell);
          if (cellChanged) rowChanged = true;
          return cellChanged;
        });
        if (rowChanged) {
          changedRows.push({
            index: rowIndex,
            cells: cells.map(formatCell),
            changed,
          });
        }
      }

      const previewRows = changedRows.slice(0, 6);
      tableDiffs.push({
        key: tableKey,
        columns: columnKeys.slice(0, 6),
        rows: previewRows.map((row) => ({
          ...row,
          cells: row.cells.slice(0, 6),
          changed: row.changed.slice(0, 6),
        })),
        totalChangedRows: changedRows.length,
        hasMoreRows: changedRows.length > previewRows.length,
        nonTabular: false,
      });
    });

    return tableDiffs;
  }, [aiDataInput, scenarioData]);

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
        {errorMessage && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
        )}
        {showSuccessPanel && (
          <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: "rgba(1, 103, 143, 0.08)" }}>
            <Tabs
              value={viewMode}
              onChange={(_, value) => setViewMode(value as "notes" | "diff")}
              textColor="primary"
              indicatorColor="primary"
              sx={{ mb: 2 }}
            >
              <Tab value="notes" label="Update Notes" />
              <Tab value="diff" label="View Diff" />
            </Tabs>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {viewMode === "notes" ? "Update Notes" : "Data Diff"}
            </Typography>
            {viewMode === "notes" ? (
              hasUpdates ? (
                <Box component="ul" sx={{ paddingLeft: "18px", margin: 0, color: "text.secondary" }}>
                  {sanitizedUpdateNotes.map((note, index) => (
                    <Typography key={`${index}-${note}`} component="li" variant="body2" sx={{ mb: 0.5 }}>
                      {note}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No update notes returned. You can still save the changes if needed.
                </Typography>
              )
            ) : diffTables.length ? (
              <Stack spacing={2}>
                {diffTables.map((table) => (
                  <Box key={table.key} sx={{ border: "1px solid rgba(1, 103, 143, 0.2)", borderRadius: 2 }}>
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        bgcolor: "rgba(1, 103, 143, 0.08)",
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                      }}
                    >
                      <Typography variant="subtitle2">{table.key}</Typography>
                    </Box>
                    {table.nonTabular ? (
                      <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Updated non-tabular values detected for this table.
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ px: 2, py: 1.5, overflowX: "auto" }}>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: `minmax(36px, 48px) repeat(${table.columns.length}, minmax(120px, 1fr))`,
                            gap: 1.5,
                            fontSize: "0.75rem",
                            minWidth: `${(table.columns.length + 1) * 120}px`,
                          }}
                        >
                          <Box sx={{ fontWeight: 600, color: "text.secondary" }}>#</Box>
                          {table.columns.map((col) => (
                            <Box key={col} sx={{ fontWeight: 600, color: "text.secondary" }}>
                              {col}
                            </Box>
                          ))}
                          {table.rows.map((row) => (
                            <React.Fragment key={`${table.key}-${row.index}`}>
                              <Box sx={{ color: "text.secondary" }}>{row.index + 1}</Box>
                              {row.cells.map((cell, idx) => (
                                <Box
                                  key={`${table.key}-${row.index}-${idx}`}
                                  sx={{
                                    px: 0.5,
                                    py: 0.25,
                                    borderRadius: 1,
                                    border: row.changed[idx]
                                      ? "1px solid rgba(1, 103, 143, 0.55)"
                                      : "1px solid rgba(0, 0, 0, 0.08)",
                                    bgcolor: row.changed[idx] ? "rgba(1, 103, 143, 0.22)" : "transparent",
                                    color: row.changed[idx] ? "text.primary" : "text.secondary",
                                    fontWeight: row.changed[idx] ? 600 : 400,
                                    opacity: row.changed[idx] ? 1 : 0.55,
                                  }}
                                >
                                  {cell}
                                </Box>
                              ))}
                            </React.Fragment>
                          ))}
                        </Box>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {table.totalChangedRows === 0
                              ? "No row-level changes detected."
                              : `Showing ${table.rows.length} of ${table.totalChangedRows} changed rows.`}
                            {table.hasMoreRows ? " Refine your prompt or review full data after saving." : ""}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No differences detected between the current scenario and the AI updates.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        {(status === "success" || status === "error") && (
          <Button onClick={handleClearPrompt} color="inherit" variant="text">
            Clear Prompt
          </Button>
        )}
        <Button onClick={handleClose} color="secondary" variant="outlined">
          Close
        </Button>
        {status === "success" && updatedScenario && (
          <Button onClick={handleSaveUpdates} color="secondary" variant="outlined" disabled={!scenarioData}>
            Save Updates
          </Button>
        )}
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
