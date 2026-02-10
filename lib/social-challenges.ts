/**
 * Service des défis sociaux avec leaderboard temps réel
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  SocialChallenge,
  ChallengeParticipant,
  ChallengeLeaderboard,
  ChallengeVideo,
  ChallengeComment,
  FriendChallenge,
  LiveLeaderboardUpdate,
} from './types-social-challenges';

class SocialChallengesManager {
  private leaderboardUpdates: Map<string, LiveLeaderboardUpdate[]> = new Map();

  /**
   * Crée un défi social
   */
  async createSocialChallenge(
    creatorId: string,
    title: string,
    description: string,
    skillId: string,
    skillName: string,
    difficulty: 'easy' | 'medium' | 'hard',
    duration: number,
    videoRequired: boolean = true
  ): Promise<SocialChallenge> {
    const now = Date.now();
    const challenge: SocialChallenge = {
      id: `challenge-${Date.now()}`,
      creatorId,
      title,
      description,
      skillId,
      skillName,
      difficulty,
      duration,
      currentParticipants: 0,
      startDate: now,
      endDate: now + duration * 24 * 60 * 60 * 1000,
      status: 'active',
      videoRequired,
      rules: [],
      createdAt: now,
    };

    await AsyncStorage.setItem(`socialChallenge-${challenge.id}`, JSON.stringify(challenge));
    return challenge;
  }

  /**
   * Récupère un défi social
   */
  async getSocialChallenge(challengeId: string): Promise<SocialChallenge | null> {
    try {
      const stored = await AsyncStorage.getItem(`socialChallenge-${challengeId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du défi:', error);
      return null;
    }
  }

  /**
   * Rejoint un défi social
   */
  async joinSocialChallenge(
    challengeId: string,
    userId: string,
    userName: string,
    userAvatar: string
  ): Promise<ChallengeParticipant> {
    const participant: ChallengeParticipant = {
      id: `participant-${Date.now()}`,
      challengeId,
      userId,
      userName,
      userAvatar,
      joinedAt: Date.now(),
      score: 0,
      approved: false,
    };

    await AsyncStorage.setItem(`challengeParticipant-${participant.id}`, JSON.stringify(participant));

    // Mettre à jour le nombre de participants
    const challenge = await this.getSocialChallenge(challengeId);
    if (challenge) {
      challenge.currentParticipants++;
      await AsyncStorage.setItem(`socialChallenge-${challengeId}`, JSON.stringify(challenge));
    }

    return participant;
  }

  /**
   * Soumet une vidéo pour un défi
   */
  async submitChallengeVideo(
    challengeId: string,
    userId: string,
    userName: string,
    videoUrl: string,
    thumbnailUrl?: string,
    duration?: number
  ): Promise<ChallengeVideo> {
    const video: ChallengeVideo = {
      id: `video-${Date.now()}`,
      challengeId,
      userId,
      userName,
      videoUrl,
      thumbnailUrl,
      duration: duration || 0,
      views: 0,
      likes: 0,
      comments: 0,
      uploadedAt: Date.now(),
      approved: false,
    };

    await AsyncStorage.setItem(`challengeVideo-${video.id}`, JSON.stringify(video));

    // Mettre à jour le participant
    const participants = await this.getChallengeParticipants(challengeId);
    const participant = participants.find(p => p.userId === userId);
    if (participant) {
      participant.videoSubmissionUrl = videoUrl;
      participant.videoSubmittedAt = Date.now();
      await AsyncStorage.setItem(`challengeParticipant-${participant.id}`, JSON.stringify(participant));
    }

    return video;
  }

  /**
   * Récupère les vidéos d'un défi
   */
  async getChallengeVideos(challengeId: string): Promise<ChallengeVideo[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const videoKeys = keys.filter(k => k.startsWith('challengeVideo-'));

      const videos: ChallengeVideo[] = [];
      for (const key of videoKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const video = JSON.parse(stored);
          if (video.challengeId === challengeId) {
            videos.push(video);
          }
        }
      }

      return videos.sort((a, b) => b.uploadedAt - a.uploadedAt);
    } catch (error) {
      console.error('Erreur lors de la récupération des vidéos:', error);
      return [];
    }
  }

  /**
   * Récupère le leaderboard en temps réel
   */
  async getLiveLeaderboard(challengeId: string): Promise<ChallengeLeaderboard> {
    try {
      const participants = await this.getChallengeParticipants(challengeId);

      // Trier par score
      const sorted = participants.sort((a, b) => b.score - a.score);

      // Assigner les rangs
      sorted.forEach((p, index) => {
        p.rank = index + 1;
      });

      return {
        challengeId,
        participants: sorted,
        totalParticipants: participants.length,
        updatedAt: Date.now(),
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du leaderboard:', error);
      return {
        challengeId,
        participants: [],
        totalParticipants: 0,
        updatedAt: Date.now(),
      };
    }
  }

  /**
   * Met à jour le score d'un participant en temps réel
   */
  async updateParticipantScore(
    challengeId: string,
    participantId: string,
    newScore: number
  ): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`challengeParticipant-${participantId}`);
      if (stored) {
        const participant = JSON.parse(stored);
        participant.score = newScore;
        await AsyncStorage.setItem(`challengeParticipant-${participantId}`, JSON.stringify(participant));

        // Enregistrer la mise à jour pour le leaderboard temps réel
        const leaderboard = await this.getLiveLeaderboard(challengeId);
        const updatedParticipant = leaderboard.participants.find(p => p.id === participantId);
        if (updatedParticipant) {
          const update: LiveLeaderboardUpdate = {
            challengeId,
            participantId,
            newScore,
            newRank: updatedParticipant.rank || 0,
            timestamp: Date.now(),
          };

          if (!this.leaderboardUpdates.has(challengeId)) {
            this.leaderboardUpdates.set(challengeId, []);
          }
          this.leaderboardUpdates.get(challengeId)!.push(update);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du score:', error);
    }
  }

  /**
   * Ajoute un like à une vidéo
   */
  async likeVideo(videoId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`challengeVideo-${videoId}`);
      if (stored) {
        const video = JSON.parse(stored);
        video.likes++;
        await AsyncStorage.setItem(`challengeVideo-${videoId}`, JSON.stringify(video));
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du like:', error);
    }
  }

  /**
   * Ajoute un commentaire à une vidéo
   */
  async addVideoComment(
    videoId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    comment: string
  ): Promise<ChallengeComment> {
    const commentObj: ChallengeComment = {
      id: `comment-${Date.now()}`,
      videoId,
      userId,
      userName,
      userAvatar,
      comment,
      likes: 0,
      replies: [],
      createdAt: Date.now(),
    };

    await AsyncStorage.setItem(`challengeComment-${commentObj.id}`, JSON.stringify(commentObj));

    // Mettre à jour le nombre de commentaires
    const stored = await AsyncStorage.getItem(`challengeVideo-${videoId}`);
    if (stored) {
      const video = JSON.parse(stored);
      video.comments++;
      await AsyncStorage.setItem(`challengeVideo-${videoId}`, JSON.stringify(video));
    }

    return commentObj;
  }

  /**
   * Récupère les commentaires d'une vidéo
   */
  async getVideoComments(videoId: string): Promise<ChallengeComment[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const commentKeys = keys.filter(k => k.startsWith('challengeComment-'));

      const comments: ChallengeComment[] = [];
      for (const key of commentKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const comment = JSON.parse(stored);
          if (comment.videoId === videoId) {
            comments.push(comment);
          }
        }
      }

      return comments.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires:', error);
      return [];
    }
  }

  /**
   * Crée un défi entre amis
   */
  async createFriendChallenge(
    creatorId: string,
    friendId: string,
    skillId: string,
    skillName: string,
    challenge: string
  ): Promise<FriendChallenge> {
    const friendChallenge: FriendChallenge = {
      id: `friendChallenge-${Date.now()}`,
      creatorId,
      friendId,
      skillId,
      skillName,
      challenge,
      status: 'pending',
      createdAt: Date.now(),
    };

    await AsyncStorage.setItem(`friendChallenge-${friendChallenge.id}`, JSON.stringify(friendChallenge));
    return friendChallenge;
  }

  /**
   * Accepte un défi entre amis
   */
  async acceptFriendChallenge(friendChallengeId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`friendChallenge-${friendChallengeId}`);
      if (stored) {
        const challenge = JSON.parse(stored);
        challenge.status = 'accepted';
        challenge.respondedAt = Date.now();
        await AsyncStorage.setItem(`friendChallenge-${friendChallengeId}`, JSON.stringify(challenge));
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation du défi:', error);
    }
  }

  /**
   * Complète un défi entre amis
   */
  async completeFriendChallenge(
    friendChallengeId: string,
    creatorScore: number,
    friendScore: number
  ): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`friendChallenge-${friendChallengeId}`);
      if (stored) {
        const challenge = JSON.parse(stored);
        challenge.status = 'completed';
        challenge.creatorScore = creatorScore;
        challenge.friendScore = friendScore;
        challenge.winner = creatorScore > friendScore ? challenge.creatorId : challenge.friendId;
        challenge.completedAt = Date.now();
        await AsyncStorage.setItem(`friendChallenge-${friendChallengeId}`, JSON.stringify(challenge));
      }
    } catch (error) {
      console.error('Erreur lors de la complétion du défi:', error);
    }
  }

  /**
   * Récupère les participants d'un défi
   */
  async getChallengeParticipants(challengeId: string): Promise<ChallengeParticipant[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const participantKeys = keys.filter(k => k.startsWith('challengeParticipant-'));

      const participants: ChallengeParticipant[] = [];
      for (const key of participantKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const participant = JSON.parse(stored);
          if (participant.challengeId === challengeId) {
            participants.push(participant);
          }
        }
      }

      return participants;
    } catch (error) {
      console.error('Erreur lors de la récupération des participants:', error);
      return [];
    }
  }

  /**
   * Obtient les mises à jour du leaderboard en temps réel
   */
  getRealtimeLeaderboardUpdates(challengeId: string): LiveLeaderboardUpdate[] {
    return this.leaderboardUpdates.get(challengeId) || [];
  }

  /**
   * Efface les mises à jour du leaderboard
   */
  clearLeaderboardUpdates(challengeId: string): void {
    this.leaderboardUpdates.delete(challengeId);
  }
}

// Instance globale
const socialChallenges = new SocialChallengesManager();

export default socialChallenges;

/**
 * Crée un défi social
 */
export async function createSocialChallenge(
  creatorId: string,
  title: string,
  description: string,
  skillId: string,
  skillName: string,
  difficulty: 'easy' | 'medium' | 'hard',
  duration: number,
  videoRequired?: boolean
): Promise<SocialChallenge> {
  return socialChallenges.createSocialChallenge(creatorId, title, description, skillId, skillName, difficulty, duration, videoRequired);
}

/**
 * Récupère un défi social
 */
export async function getSocialChallenge(challengeId: string): Promise<SocialChallenge | null> {
  return socialChallenges.getSocialChallenge(challengeId);
}

/**
 * Rejoint un défi social
 */
export async function joinSocialChallenge(
  challengeId: string,
  userId: string,
  userName: string,
  userAvatar: string
): Promise<ChallengeParticipant> {
  return socialChallenges.joinSocialChallenge(challengeId, userId, userName, userAvatar);
}

/**
 * Soumet une vidéo pour un défi
 */
export async function submitChallengeVideo(
  challengeId: string,
  userId: string,
  userName: string,
  videoUrl: string,
  thumbnailUrl?: string,
  duration?: number
): Promise<ChallengeVideo> {
  return socialChallenges.submitChallengeVideo(challengeId, userId, userName, videoUrl, thumbnailUrl, duration);
}

/**
 * Récupère les vidéos d'un défi
 */
export async function getChallengeVideos(challengeId: string): Promise<ChallengeVideo[]> {
  return socialChallenges.getChallengeVideos(challengeId);
}

/**
 * Récupère le leaderboard en temps réel
 */
export async function getLiveLeaderboard(challengeId: string): Promise<ChallengeLeaderboard> {
  return socialChallenges.getLiveLeaderboard(challengeId);
}

/**
 * Met à jour le score d'un participant
 */
export async function updateParticipantScore(
  challengeId: string,
  participantId: string,
  newScore: number
): Promise<void> {
  return socialChallenges.updateParticipantScore(challengeId, participantId, newScore);
}

/**
 * Ajoute un like à une vidéo
 */
export async function likeVideo(videoId: string): Promise<void> {
  return socialChallenges.likeVideo(videoId);
}

/**
 * Ajoute un commentaire à une vidéo
 */
export async function addVideoComment(
  videoId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  comment: string
): Promise<ChallengeComment> {
  return socialChallenges.addVideoComment(videoId, userId, userName, userAvatar, comment);
}

/**
 * Récupère les commentaires d'une vidéo
 */
export async function getVideoComments(videoId: string): Promise<ChallengeComment[]> {
  return socialChallenges.getVideoComments(videoId);
}

/**
 * Crée un défi entre amis
 */
export async function createFriendChallenge(
  creatorId: string,
  friendId: string,
  skillId: string,
  skillName: string,
  challenge: string
): Promise<FriendChallenge> {
  return socialChallenges.createFriendChallenge(creatorId, friendId, skillId, skillName, challenge);
}

/**
 * Accepte un défi entre amis
 */
export async function acceptFriendChallenge(friendChallengeId: string): Promise<void> {
  return socialChallenges.acceptFriendChallenge(friendChallengeId);
}

/**
 * Complète un défi entre amis
 */
export async function completeFriendChallenge(
  friendChallengeId: string,
  creatorScore: number,
  friendScore: number
): Promise<void> {
  return socialChallenges.completeFriendChallenge(friendChallengeId, creatorScore, friendScore);
}

/**
 * Récupère les participants d'un défi
 */
export async function getChallengeParticipants(challengeId: string): Promise<ChallengeParticipant[]> {
  return socialChallenges.getChallengeParticipants(challengeId);
}

/**
 * Obtient les mises à jour du leaderboard en temps réel
 */
export function getRealtimeLeaderboardUpdates(challengeId: string): LiveLeaderboardUpdate[] {
  return socialChallenges.getRealtimeLeaderboardUpdates(challengeId);
}
