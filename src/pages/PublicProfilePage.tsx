import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserIcon,
  BookOpenIcon,
  HeadphonesIcon,
  UserPlusIcon,
  UserCheckIcon,
  ClockIcon,
  Loader2Icon,
  ShieldIcon,
  LockIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getPublicProfile,
  getUserPublicStories,
  sendFollowRequest,
  getFollowStatus,
  unfollowUser,
} from '../lib/firebase';
import type { PublicProfile, Story, FollowStatus } from '../types';

export const PublicProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user, profile: myProfile } = useAuth();

  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [followStatus, setFollowStatus] = useState<FollowStatus | null>(null);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    Promise.all([
      getPublicProfile(userId),
      getUserPublicStories(userId),
    ]).then(([profile, userStories]) => {
      setPublicProfile(profile);
      setStories(userStories);
      setLoading(false);
    }).catch(() => setLoading(false));

    // Check follow status
    if (user?.uid && userId !== user.uid) {
      getFollowStatus(user.uid, userId).then(status => {
        setFollowStatus(status);
      });
    }
  }, [userId, user?.uid]);

  const handleFollow = async () => {
    if (!user?.uid || !userId || !myProfile) return;

    // Check parental consent for children
    if (myProfile.isChild && !myProfile.parentalConsentGranted) {
      alert('Parental consent is required to follow other users.');
      return;
    }

    setFollowLoading(true);
    try {
      await sendFollowRequest(
        user.uid,
        userId,
        myProfile.displayName,
        myProfile.avatarUrl
      );
      setFollowStatus('pending');
    } catch (err) {
      console.error('Failed to send follow request:', err);
    }
    setFollowLoading(false);
  };

  const handleUnfollow = async () => {
    if (!user?.uid || !userId) return;
    setFollowLoading(true);
    try {
      await unfollowUser(user.uid, userId);
      setFollowStatus(null);
    } catch (err) {
      console.error('Failed to unfollow:', err);
    }
    setFollowLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2Icon size={32} className="animate-spin text-purple-500" />
      </div>
    );
  }

  if (!publicProfile) {
    return (
      <div className="text-center py-12">
        <UserIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-display text-gray-600 mb-2">Profile Not Found</h2>
        <p className="text-gray-400 font-body">This user doesn't exist or their profile is private.</p>
      </div>
    );
  }

  if (publicProfile.visibility === 'private' && userId !== user?.uid) {
    return (
      <div className="text-center py-12">
        <LockIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-display text-gray-600 mb-2">Private Profile</h2>
        <p className="text-gray-400 font-body">This profile is set to private.</p>
      </div>
    );
  }

  const isOwnProfile = userId === user?.uid;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
        <div className="h-24 bg-gradient-to-r from-purple-500 to-blue-500" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
              {publicProfile.avatarUrl ? (
                <img
                  src={publicProfile.avatarUrl}
                  alt={publicProfile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon size={32} className="text-gray-400" />
              )}
            </div>
            {!isOwnProfile && user && (
              <div className="ml-auto">
                {followStatus === 'accepted' ? (
                  <button
                    onClick={handleUnfollow}
                    disabled={followLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-body font-semibold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <UserCheckIcon size={16} />
                    Following
                  </button>
                ) : followStatus === 'pending' ? (
                  <button
                    disabled
                    className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl font-body font-semibold text-sm"
                  >
                    <ClockIcon size={16} />
                    Requested
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl font-body font-semibold text-sm hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    {followLoading ? (
                      <Loader2Icon size={16} className="animate-spin" />
                    ) : (
                      <UserPlusIcon size={16} />
                    )}
                    Follow
                  </button>
                )}
              </div>
            )}
          </div>

          <h2 className="text-2xl font-display text-gray-800">{publicProfile.displayName}</h2>
          {publicProfile.bio && (
            <p className="text-gray-500 font-body text-sm mt-1">{publicProfile.bio}</p>
          )}
          {publicProfile.isChild && (
            <div className="flex items-center gap-1 text-xs text-amber-600 mt-2">
              <ShieldIcon size={12} />
              <span>Child account</span>
            </div>
          )}

          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{publicProfile.storyCount}</p>
              <p className="text-xs text-gray-500 font-body">Stories</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{publicProfile.followerCount}</p>
              <p className="text-xs text-gray-500 font-body">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{publicProfile.followingCount}</p>
              <p className="text-xs text-gray-500 font-body">Following</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stories */}
      <h3 className="text-xl font-display text-gray-700 mb-4">Published Stories</h3>
      {stories.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-2xl shadow-lg">
          <BookOpenIcon size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-body">No public stories yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stories.map(story => (
            <button
              key={story.id}
              onClick={() => navigate(`/story/${story.id}`)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow text-left"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-purple-200 to-blue-200">
                {story.coverImageUrl && (
                  <img
                    src={story.coverImageUrl}
                    alt={story.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {story.format === 'audiobook' && (
                  <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                    <HeadphonesIcon size={12} />
                    Audiobook
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-display text-lg text-gray-800 line-clamp-1">{story.title}</h4>
                {story.synopsis && (
                  <p className="text-xs text-gray-400 font-body mt-1 line-clamp-2">{story.synopsis}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>Age {story.childAge}+</span>
                  <span>~{story.estimatedReadMinutes} min</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
