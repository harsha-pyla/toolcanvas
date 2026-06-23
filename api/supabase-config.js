// Vercel Serverless Function to securely serve Supabase credentials
// dynamically from Vercel environment variables.
module.exports = (req, res) => {
  // Set cache headers to avoid unnecessary repeat executions
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_ANON_KEY || ''
  });
};
