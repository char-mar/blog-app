export interface FollowStateDto {
  following: boolean;
  followersCount: number;
}

export interface FollowUserDto {
  id: string;
  name: string;
  avatarUrl: string | null;
  followedAt: string;
}
