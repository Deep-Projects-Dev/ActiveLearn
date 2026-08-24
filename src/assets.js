const files = import.meta.glob('./assets/**/*.{png,jpg,jpeg,gif,svg,webp}',
  {
    eager: true,
    query: '?url',
    import: 'default',
  }
);

export const assets = Object.fromEntries(
  Object.entries(files).map(([path, url]) => {
    const name = path.split('/').pop().split('.')[0];
    return [name, url];
  })
);
