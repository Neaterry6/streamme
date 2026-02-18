export interface User {
  username: string;
  password?: string;
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  views: string;
  duration: string;
  author: string;
  url?: string;
}

export interface Lyrics {
  song: string;
  lyrics: string;
}
