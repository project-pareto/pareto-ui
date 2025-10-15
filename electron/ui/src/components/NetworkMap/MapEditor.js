import React, { useState } from 'react';
import { Box, Button, TextField, Select, MenuItem, Typography } from '@mui/material';

export default function MapEditor(props) {
    const {
        networkMapData,
        onAddNode,
        onAddPipeline,
        onUpdateItem
    } = props;
    const [selectedItem, setSelectedItem] = useState(null);
    const [editData, setEditData] = useState({
        name: '',
        coordinates: '',
        nodeType: ''
    });

    const handleSelectItem = (item) => {
        setSelectedItem(item);
        setEditData({
        name: item.name || '',
        coordinates: item.coordinates || '',
        nodeType: item.nodeType || ''
        });
    };

    const handleSave = () => {
        onUpdateItem(selectedItem.id, editData);
        setSelectedItem(null);
    };

    return (
        <Box sx={{ padding: 2, borderTop: '1px solid #ccc' }}>
        <Typography variant="h6" gutterBottom>
            Map Editor
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button variant="contained" onClick={onAddNode}>Add Node</Button>
            <Button variant="contained" onClick={onAddPipeline}>Add Pipeline</Button>
        </Box>

        <Typography variant="subtitle1">Items:</Typography>
        {networkMapData?.map((item) => (
            <Box
            key={item.id}
            sx={{
                cursor: 'pointer',
                padding: '4px',
                border: selectedItem?.id === item.id ? '1px solid #0b89b9' : '1px solid #ccc',
                borderRadius: 1,
                mb: 1
            }}
            onClick={() => handleSelectItem(item)}
            >
            {item.name || `Item ${item.id}`} ({item.type})
            </Box>
        ))}

        {selectedItem && (
            <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Edit Item</Typography>

            <TextField
                label="Name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                fullWidth
                sx={{ mb: 1 }}
            />

            <TextField
                label="Coordinates"
                value={editData.coordinates}
                onChange={(e) => setEditData({ ...editData, coordinates: e.target.value })}
                fullWidth
                sx={{ mb: 1 }}
            />

            {selectedItem.type === 'node' && (
                <Select
                value={editData.nodeType}
                onChange={(e) => setEditData({ ...editData, nodeType: e.target.value })}
                fullWidth
                sx={{ mb: 1 }}
                >
                <MenuItem value="source">Source</MenuItem>
                <MenuItem value="sink">Sink</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                </Select>
            )}

            <Button variant="contained" onClick={handleSave}>Save Changes</Button>
            </Box>
        )}
        </Box>
    );
}