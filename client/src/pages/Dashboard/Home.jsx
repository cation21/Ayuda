import { Heart, MessageCircle, Share2 } from "lucide-react";

const posts = [
  {
    id: 1,
    user: "Rahul Verma",
    avatar: "https://i.pravatar.cc/100?img=12",
    category: "Medical",
    title: "Help my father undergo heart surgery",
    description:
      "We urgently need financial support for my father's surgery. Every contribution makes a difference.",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800",
    raised: "₹78,000",
    goal: "₹1,50,000",
    progress: 52,
  },
  {
    id: 2,
    user: "Ananya Sharma",
    avatar: "https://i.pravatar.cc/100?img=5",
    category: "Education",
    title: "Support underprivileged students",
    description:
      "Help provide school supplies and tuition fees for children in rural communities.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",
    raised: "₹42,000",
    goal: "₹75,000",
    progress: 56,
  },
];

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Create Post */}

      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <div className="flex gap-4">
          <img
            src="https://i.pravatar.cc/100?img=12"
            className="w-12 h-12 rounded-full"
          />

          <button className="flex-1 h-12 rounded-full bg-gray-100 text-left px-5 text-gray-500 hover:bg-gray-200 transition">
            Share a cause with the community...
          </button>
        </div>
      </div>

      {/* Categories */}

      <div className="flex gap-3 overflow-x-auto">
        {["All", "Medical", "Education", "Food", "Disaster", "Animals"].map(
          (item) => (
            <button
              key={item}
              className="px-5 py-2 rounded-full bg-white border hover:bg-blue-600 hover:text-white transition whitespace-nowrap"
            >
              {item}
            </button>
          ),
        )}
      </div>

      {/* Feed */}

      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-2xl shadow-sm border overflow-hidden"
        >
          {/* Header */}

          <div className="flex items-center justify-between p-5">
            <div className="flex gap-3">
              <img src={post.avatar} className="w-12 h-12 rounded-full" />

              <div>
                <h2 className="font-semibold">{post.user}</h2>

                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
            </div>

            <span className="text-sm text-gray-400">2 hrs ago</span>
          </div>

          {/* Body */}

          <div className="px-5">
            <h2 className="text-xl font-semibold">{post.title}</h2>

            <p className="mt-2 text-gray-600">{post.description}</p>
          </div>

          <img src={post.image} className="w-full h-80 object-cover mt-5" />

          {/* Donation */}

          <div className="p-5">
            <div className="flex justify-between text-sm mb-2">
              <span>{post.raised}</span>

              <span>{post.goal}</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${post.progress}%` }}
              />
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {post.progress}% Funded
            </p>
          </div>

          {/* Actions */}

          <div className="flex border-t">
            <button className="flex-1 flex justify-center items-center gap-2 py-4 hover:bg-gray-50">
              <Heart size={18} />
              Donate
            </button>

            <button className="flex-1 flex justify-center items-center gap-2 py-4 hover:bg-gray-50 border-x">
              <MessageCircle size={18} />
              Comment
            </button>

            <button className="flex-1 flex justify-center items-center gap-2 py-4 hover:bg-gray-50">
              <Share2 size={18} />
              Share
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;
