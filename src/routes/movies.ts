import express from 'express';

const router = express.Router();

// OMDb API configuration
const OMDb_API_KEY = process.env.OMDB_API_KEY || 'your_api_key_here';
const OMDb_BASE_URL = 'http://www.omdbapi.com/';

// Fetch movie data from OMDb API
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'movie', page = 1 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const response = await fetch(`${OMDb_BASE_URL}?s=${encodeURIComponent(q)}&type=${type}&page=${page}&apikey=${OMDb_API_KEY}`);

    if (!response.ok) {
      throw new Error('Failed to fetch from OMDb API');
    }

    const data = await response.json();

    if (data.Error) {
      return res.status(404).json({ error: data.Error });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching movie data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get detailed movie information
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Movie ID is required' });
    }

    const response = await fetch(`${OMDb_BASE_URL}?i=${id}&plot=full&apikey=${OMDb_API_KEY}`);

    if (!response.ok) {
      throw new Error('Failed to fetch from OMDb API');
    }

    const data = await response.json();

    if (data.Error) {
      return res.status(404).json({ error: data.Error });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as movieRoutes };
