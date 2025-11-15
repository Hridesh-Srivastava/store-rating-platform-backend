import supabase from '../config/database.js';

export const submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.userId;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if rating exists
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('user_id', userId)
      .eq('store_id', storeId)
      .single();

    if (existingRating) {
      // Update existing rating
      const { error: updateError } = await supabase
        .from('ratings')
        .update({ rating })
        .eq('user_id', userId)
        .eq('store_id', storeId);

      if (updateError) {
        return res.status(500).json({ error: 'Failed to update rating' });
      }

      return res.json({ message: 'Rating updated successfully' });
    }

    // Insert new rating
    const { error: insertError } = await supabase
      .from('ratings')
      .insert([
        {
          user_id: userId,
          store_id: storeId,
          rating,
        },
      ]);

    if (insertError) {
      return res.status(500).json({ error: 'Failed to submit rating' });
    }

    res.status(201).json({ message: 'Rating submitted successfully' });
  } catch (err) {
    console.error('Submit rating error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserRatingForStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.userId;

    const { data: rating, error } = await supabase
      .from('ratings')
      .select('id, rating')
      .eq('user_id', userId)
      .eq('store_id', storeId)
      .single();

    if (!rating) {
      return res.status(404).json({ error: 'No rating found' });
    }

    res.json(rating);
  } catch (err) {
    console.error('Get rating error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStoreRatings = async (req, res) => {
  try {
    const { storeId } = req.params;

    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('id, rating, created_at, updated_at, users(name)')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch ratings' });
    }

    // Flatten the response
    const formattedRatings = ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      created_at: r.created_at,
      updated_at: r.updated_at,
      name: r.users?.name,
    }));

    res.json(formattedRatings);
  } catch (err) {
    console.error('Get store ratings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
