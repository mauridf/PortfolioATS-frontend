export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  username?: string;
}

export interface SocialLinkRequest {
  platform: string;
  url: string;
  username?: string;
}