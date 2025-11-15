import supabase from '../config/database.js';

export const createStore = async (req, res) => {
  try {
    const { name, address, email, ownerId } = req.body;

    if (!name || name.length < 20 || name.length > 60) {
      return res.status(400).json({ error: 'Store name must be 20-60 characters' });
    }

    if (!address || address.length > 400) {
      return res.status(400).json({ error: 'Address must be max 400 characters' });
    }

    const { data: store, error } = await supabase
      .from('stores')
      .insert([
        {
          name,
          address,
          email,
          owner_id: ownerId,
        },
      ])
      .select('id, name, address, email')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create store' });
    }

    res.status(201).json({
      message: 'Store created successfully',
      store,
    });
  } catch (err) {
    console.error('Create store error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllStores = async (req, res) => {
  try {
    const { search, sortBy = 'name' } = req.query;

    let query = supabase
      .from('stores')
      .select('id, name, address, owner_id, email');

    if (search) {
      query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
    }

    if (sortBy === 'address') {
      query = query.order('address', { ascending: true });
    } else {
      query = query.order('name', { ascending: true });
    }

    const { data: stores, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch stores' });
    }

    const storesWithRatings = await Promise.all(
      stores.map(async (store) => {
        const { data: ratings, error: ratingError } = await supabase
          .from('ratings')
          .select('rating')
          .eq('store_id', store.id);

        const totalRatings = ratings?.length || 0;
        let averageRating = 0;
        
        if (totalRatings > 0) {
          let sum = 0;
          for (const r of ratings) {
            sum += r.rating;
          }
          averageRating = (sum / totalRatings).toFixed(1);
        }

        return {
          ...store,
          total_ratings: totalRatings,
          average_rating: parseFloat(averageRating),
        };
      })
    );

    if (sortBy === 'rating') {
      storesWithRatings.sort((a, b) => b.average_rating - a.average_rating);
    }

    res.json(storesWithRatings);
  } catch (err) {
    console.error('Get stores error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, name, address, owner_id, email')
      .eq('id', id)
      .single();

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const { data: ratings, error: ratingError } = await supabase
      .from('ratings')
      .select('rating')
      .eq('store_id', id);

    const totalRatings = ratings?.length || 0;
    let averageRating = 0;
    
    if (totalRatings > 0) {
      let ratingSum = 0;
      for (let i = 0; i < ratings.length; i++) {
        ratingSum += ratings[i].rating;
      }
      averageRating = (ratingSum / totalRatings).toFixed(1);
    }

    res.json({
      ...store,
      total_ratings: totalRatings,
      average_rating: parseFloat(averageRating),
    });
  } catch (err) {
    console.error('Get store error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
