export const posts = [
  {
    id: 1,
    username: 'johndoe',
    userImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
    caption: 'Beautiful sunset at the beach! 🌅 #sunset #beach #vacation',
    likes: 1234,
    comments: [
      { id: 1, username: 'jane_smith', text: 'Amazing view! 😍' },
      { id: 2, username: 'mike_wilson', text: 'Where is this?' }
    ],
    timestamp: '2 HOURS AGO'
  },
  {
    id: 2,
    username: 'jane_smith',
    userImage: 'https://randomuser.me/api/portraits/women/1.jpg',
    image: 'https://images.unsplash.com/photo-1682687221038-404670f09727',
    caption: 'Coffee time ☕️ #coffee #morning',
    likes: 856,
    comments: [
      { id: 1, username: 'coffee_lover', text: 'Perfect way to start the day!' }
    ],
    timestamp: '5 HOURS AGO'
  },
  // ... Add 8 more similar objects with different images and users
  {
    id: 10,
    username: "urban_explorer",
    userImage: "https://i.pravatar.cc/150?img=10",
    image: "https://source.unsplash.com/random/800x800?city,10",
    caption: "City lights never disappoint ✨ #cityscape #night",
    likes: 0,
    comments: [],
    timestamp: "Just now"
  }
]; 