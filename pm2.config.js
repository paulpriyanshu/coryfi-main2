module.exports = {
    apps: [
      {
        name: 'nextjs',
        script: './node_modules/next/dist/bin/next',
        args: 'start',
        exec_mode: 'cluster',      
        instances: -1,
      },
    ],
  };