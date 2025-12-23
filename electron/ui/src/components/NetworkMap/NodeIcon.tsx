import { Typography } from '@mui/material';

export const NodeIcon = ({ src, alt, size = 24 }) => {
  return (
    <Typography
      component="img"
      src={src}
      alt={alt}
      sx={{
        width: size,
        height: size,
        objectFit: 'contain',
        ml: 1
      }}
    />
  );
};
