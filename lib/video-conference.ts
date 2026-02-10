/**
 * Service de vidéoconférence en direct avec Agora/Twilio
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VideoRoom {
  id: string;
  sessionId: string;
  hostId: string;
  hostName: string;
  title: string;
  description: string;
  status: 'scheduled' | 'live' | 'ended';
  startTime: number;
  endTime?: number;
  maxParticipants: number;
  currentParticipants: number;
  recordingEnabled: boolean;
  recordingUrl?: string;
  agoraChannelId?: string;
  twilioRoomSid?: string;
  createdAt: number;
}

export interface VideoParticipant {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  joinedAt: number;
  leftAt?: number;
  duration: number; // en secondes
  videoEnabled: boolean;
  audioEnabled: boolean;
  isHost: boolean;
  agoraUserId?: number;
}

export interface VideoRecording {
  id: string;
  roomId: string;
  recordingUrl: string;
  duration: number; // en secondes
  fileSize: number; // en bytes
  format: 'mp4' | 'webm';
  startedAt: number;
  completedAt: number;
  status: 'recording' | 'processing' | 'completed' | 'failed';
}

export interface VideoChat {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

export interface ScreenShare {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  startedAt: number;
  endedAt?: number;
  status: 'active' | 'ended';
}

export interface VideoQuality {
  roomId: string;
  userId: string;
  resolution: '360p' | '720p' | '1080p';
  frameRate: number;
  bitrate: number;
  packetLoss: number;
  latency: number;
  timestamp: number;
}

export interface VideoInvitation {
  id: string;
  roomId: string;
  inviterId: string;
  inviteeId: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: number;
  respondedAt?: number;
  expiresAt: number;
}

export interface VideoSchedule {
  id: string;
  hostId: string;
  title: string;
  description: string;
  scheduledTime: number;
  duration: number; // en minutes
  maxParticipants: number;
  status: 'scheduled' | 'cancelled';
  invitedUsers: string[];
  createdAt: number;
}

class VideoConferenceManager {
  private agoraAppId: string = '';
  private twilioAccountSid: string = '';
  private twilioAuthToken: string = '';

  constructor(agoraAppId?: string, twilioAccountSid?: string, twilioAuthToken?: string) {
    this.agoraAppId = agoraAppId || '';
    this.twilioAccountSid = twilioAccountSid || '';
    this.twilioAuthToken = twilioAuthToken || '';
  }

  /**
   * Crée une salle vidéo
   */
  async createVideoRoom(
    hostId: string,
    hostName: string,
    title: string,
    description: string,
    maxParticipants: number = 100,
    recordingEnabled: boolean = false
  ): Promise<VideoRoom> {
    const room: VideoRoom = {
      id: `room-${Date.now()}`,
      sessionId: `session-${Date.now()}`,
      hostId,
      hostName,
      title,
      description,
      status: 'scheduled',
      startTime: Date.now(),
      maxParticipants,
      currentParticipants: 1,
      recordingEnabled,
      createdAt: Date.now(),
    };

    await AsyncStorage.setItem(`videoRoom-${room.id}`, JSON.stringify(room));
    return room;
  }

  /**
   * Récupère une salle vidéo
   */
  async getVideoRoom(roomId: string): Promise<VideoRoom | null> {
    try {
      const stored = await AsyncStorage.getItem(`videoRoom-${roomId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la salle vidéo:', error);
      return null;
    }
  }

  /**
   * Démarre une salle vidéo
   */
  async startVideoRoom(roomId: string): Promise<void> {
    try {
      const room = await this.getVideoRoom(roomId);
      if (room) {
        room.status = 'live';
        await AsyncStorage.setItem(`videoRoom-${roomId}`, JSON.stringify(room));
      }
    } catch (error) {
      console.error('Erreur lors du démarrage de la salle:', error);
    }
  }

  /**
   * Termine une salle vidéo
   */
  async endVideoRoom(roomId: string): Promise<void> {
    try {
      const room = await this.getVideoRoom(roomId);
      if (room) {
        room.status = 'ended';
        room.endTime = Date.now();
        await AsyncStorage.setItem(`videoRoom-${roomId}`, JSON.stringify(room));
      }
    } catch (error) {
      console.error('Erreur lors de la fin de la salle:', error);
    }
  }

  /**
   * Ajoute un participant à la salle
   */
  async addParticipant(
    roomId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    isHost: boolean = false
  ): Promise<VideoParticipant> {
    const participant: VideoParticipant = {
      id: `participant-${Date.now()}`,
      roomId,
      userId,
      userName,
      userAvatar,
      joinedAt: Date.now(),
      duration: 0,
      videoEnabled: true,
      audioEnabled: true,
      isHost,
    };

    await AsyncStorage.setItem(`videoParticipant-${participant.id}`, JSON.stringify(participant));

    // Mettre à jour le nombre de participants
    const room = await this.getVideoRoom(roomId);
    if (room) {
      room.currentParticipants++;
      await AsyncStorage.setItem(`videoRoom-${roomId}`, JSON.stringify(room));
    }

    return participant;
  }

  /**
   * Récupère les participants d'une salle
   */
  async getParticipants(roomId: string): Promise<VideoParticipant[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const participantKeys = keys.filter(k => k.startsWith('videoParticipant-'));

      const participants: VideoParticipant[] = [];
      for (const key of participantKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const participant = JSON.parse(stored);
          if (participant.roomId === roomId && !participant.leftAt) {
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
   * Supprime un participant
   */
  async removeParticipant(participantId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`videoParticipant-${participantId}`);
      if (stored) {
        const participant = JSON.parse(stored);
        participant.leftAt = Date.now();
        participant.duration = Math.floor((participant.leftAt - participant.joinedAt) / 1000);
        await AsyncStorage.setItem(`videoParticipant-${participantId}`, JSON.stringify(participant));

        // Mettre à jour le nombre de participants
        const room = await this.getVideoRoom(participant.roomId);
        if (room && room.currentParticipants > 0) {
          room.currentParticipants--;
          await AsyncStorage.setItem(`videoRoom-${participant.roomId}`, JSON.stringify(room));
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du participant:', error);
    }
  }

  /**
   * Démarre l'enregistrement
   */
  async startRecording(roomId: string): Promise<VideoRecording> {
    const recording: VideoRecording = {
      id: `recording-${Date.now()}`,
      roomId,
      recordingUrl: '',
      duration: 0,
      fileSize: 0,
      format: 'mp4',
      startedAt: Date.now(),
      completedAt: 0,
      status: 'recording',
    };

    await AsyncStorage.setItem(`videoRecording-${recording.id}`, JSON.stringify(recording));
    return recording;
  }

  /**
   * Termine l'enregistrement
   */
  async stopRecording(recordingId: string): Promise<VideoRecording> {
    try {
      const stored = await AsyncStorage.getItem(`videoRecording-${recordingId}`);
      if (stored) {
        const recording = JSON.parse(stored);
        recording.status = 'processing';
        recording.completedAt = Date.now();
        recording.duration = Math.floor((recording.completedAt - recording.startedAt) / 1000);
        await AsyncStorage.setItem(`videoRecording-${recordingId}`, JSON.stringify(recording));

        // Simuler le traitement
        setTimeout(async () => {
          recording.status = 'completed';
          recording.recordingUrl = `https://recordings.coachia.app/${recordingId}.mp4`;
          await AsyncStorage.setItem(`videoRecording-${recordingId}`, JSON.stringify(recording));
        }, 5000);

        return recording;
      }
      throw new Error('Enregistrement non trouvé');
    } catch (error) {
      console.error('Erreur lors de l\'arrêt de l\'enregistrement:', error);
      throw error;
    }
  }

  /**
   * Ajoute un message de chat
   */
  async addChatMessage(
    roomId: string,
    userId: string,
    userName: string,
    message: string
  ): Promise<VideoChat> {
    const chat: VideoChat = {
      id: `chat-${Date.now()}`,
      roomId,
      userId,
      userName,
      message,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(`videoChat-${chat.id}`, JSON.stringify(chat));
    return chat;
  }

  /**
   * Récupère les messages de chat
   */
  async getChatMessages(roomId: string): Promise<VideoChat[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const chatKeys = keys.filter(k => k.startsWith('videoChat-'));

      const messages: VideoChat[] = [];
      for (const key of chatKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const chat = JSON.parse(stored);
          if (chat.roomId === roomId) {
            messages.push(chat);
          }
        }
      }

      return messages.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return [];
    }
  }

  /**
   * Démarre le partage d'écran
   */
  async startScreenShare(roomId: string, userId: string, userName: string): Promise<ScreenShare> {
    const share: ScreenShare = {
      id: `share-${Date.now()}`,
      roomId,
      userId,
      userName,
      startedAt: Date.now(),
      status: 'active',
    };

    await AsyncStorage.setItem(`screenShare-${share.id}`, JSON.stringify(share));
    return share;
  }

  /**
   * Termine le partage d'écran
   */
  async stopScreenShare(shareId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`screenShare-${shareId}`);
      if (stored) {
        const share = JSON.parse(stored);
        share.status = 'ended';
        share.endedAt = Date.now();
        await AsyncStorage.setItem(`screenShare-${shareId}`, JSON.stringify(share));
      }
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du partage d\'écran:', error);
    }
  }

  /**
   * Crée une invitation vidéo
   */
  async createVideoInvitation(
    roomId: string,
    inviterId: string,
    inviteeId: string,
    expirationMinutes: number = 30
  ): Promise<VideoInvitation> {
    const invitation: VideoInvitation = {
      id: `invite-${Date.now()}`,
      roomId,
      inviterId,
      inviteeId,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + expirationMinutes * 60 * 1000,
    };

    await AsyncStorage.setItem(`videoInvitation-${invitation.id}`, JSON.stringify(invitation));
    return invitation;
  }

  /**
   * Accepte une invitation vidéo
   */
  async acceptVideoInvitation(invitationId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`videoInvitation-${invitationId}`);
      if (stored) {
        const invitation = JSON.parse(stored);
        invitation.status = 'accepted';
        invitation.respondedAt = Date.now();
        await AsyncStorage.setItem(`videoInvitation-${invitationId}`, JSON.stringify(invitation));
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
    }
  }

  /**
   * Décline une invitation vidéo
   */
  async declineVideoInvitation(invitationId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`videoInvitation-${invitationId}`);
      if (stored) {
        const invitation = JSON.parse(stored);
        invitation.status = 'declined';
        invitation.respondedAt = Date.now();
        await AsyncStorage.setItem(`videoInvitation-${invitationId}`, JSON.stringify(invitation));
      }
    } catch (error) {
      console.error('Erreur lors du refus de l\'invitation:', error);
    }
  }

  /**
   * Crée une session vidéo programmée
   */
  async scheduleVideoSession(
    hostId: string,
    title: string,
    description: string,
    scheduledTime: number,
    duration: number,
    maxParticipants: number,
    invitedUsers: string[]
  ): Promise<VideoSchedule> {
    const schedule: VideoSchedule = {
      id: `schedule-${Date.now()}`,
      hostId,
      title,
      description,
      scheduledTime,
      duration,
      maxParticipants,
      status: 'scheduled',
      invitedUsers,
      createdAt: Date.now(),
    };

    await AsyncStorage.setItem(`videoSchedule-${schedule.id}`, JSON.stringify(schedule));
    return schedule;
  }

  /**
   * Récupère les sessions programmées
   */
  async getScheduledSessions(userId: string): Promise<VideoSchedule[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const scheduleKeys = keys.filter(k => k.startsWith('videoSchedule-'));

      const schedules: VideoSchedule[] = [];
      for (const key of scheduleKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const schedule = JSON.parse(stored);
          if (schedule.hostId === userId || schedule.invitedUsers.includes(userId)) {
            schedules.push(schedule);
          }
        }
      }

      return schedules.sort((a, b) => a.scheduledTime - b.scheduledTime);
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions programmées:', error);
      return [];
    }
  }
}

// Instance globale
const videoConference = new VideoConferenceManager();

export default videoConference;

/**
 * Crée une salle vidéo
 */
export async function createVideoRoom(
  hostId: string,
  hostName: string,
  title: string,
  description: string,
  maxParticipants?: number,
  recordingEnabled?: boolean
): Promise<VideoRoom> {
  return videoConference.createVideoRoom(hostId, hostName, title, description, maxParticipants, recordingEnabled);
}

/**
 * Récupère une salle vidéo
 */
export async function getVideoRoom(roomId: string): Promise<VideoRoom | null> {
  return videoConference.getVideoRoom(roomId);
}

/**
 * Démarre une salle vidéo
 */
export async function startVideoRoom(roomId: string): Promise<void> {
  return videoConference.startVideoRoom(roomId);
}

/**
 * Termine une salle vidéo
 */
export async function endVideoRoom(roomId: string): Promise<void> {
  return videoConference.endVideoRoom(roomId);
}

/**
 * Ajoute un participant
 */
export async function addParticipant(
  roomId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  isHost?: boolean
): Promise<VideoParticipant> {
  return videoConference.addParticipant(roomId, userId, userName, userAvatar, isHost);
}

/**
 * Récupère les participants
 */
export async function getParticipants(roomId: string): Promise<VideoParticipant[]> {
  return videoConference.getParticipants(roomId);
}

/**
 * Supprime un participant
 */
export async function removeParticipant(participantId: string): Promise<void> {
  return videoConference.removeParticipant(participantId);
}

/**
 * Démarre l'enregistrement
 */
export async function startRecording(roomId: string): Promise<VideoRecording> {
  return videoConference.startRecording(roomId);
}

/**
 * Termine l'enregistrement
 */
export async function stopRecording(recordingId: string): Promise<VideoRecording> {
  return videoConference.stopRecording(recordingId);
}

/**
 * Ajoute un message de chat
 */
export async function addChatMessage(
  roomId: string,
  userId: string,
  userName: string,
  message: string
): Promise<VideoChat> {
  return videoConference.addChatMessage(roomId, userId, userName, message);
}

/**
 * Récupère les messages de chat
 */
export async function getChatMessages(roomId: string): Promise<VideoChat[]> {
  return videoConference.getChatMessages(roomId);
}

/**
 * Démarre le partage d'écran
 */
export async function startScreenShare(
  roomId: string,
  userId: string,
  userName: string
): Promise<ScreenShare> {
  return videoConference.startScreenShare(roomId, userId, userName);
}

/**
 * Termine le partage d'écran
 */
export async function stopScreenShare(shareId: string): Promise<void> {
  return videoConference.stopScreenShare(shareId);
}

/**
 * Crée une invitation vidéo
 */
export async function createVideoInvitation(
  roomId: string,
  inviterId: string,
  inviteeId: string,
  expirationMinutes?: number
): Promise<VideoInvitation> {
  return videoConference.createVideoInvitation(roomId, inviterId, inviteeId, expirationMinutes);
}

/**
 * Accepte une invitation vidéo
 */
export async function acceptVideoInvitation(invitationId: string): Promise<void> {
  return videoConference.acceptVideoInvitation(invitationId);
}

/**
 * Décline une invitation vidéo
 */
export async function declineVideoInvitation(invitationId: string): Promise<void> {
  return videoConference.declineVideoInvitation(invitationId);
}

/**
 * Crée une session vidéo programmée
 */
export async function scheduleVideoSession(
  hostId: string,
  title: string,
  description: string,
  scheduledTime: number,
  duration: number,
  maxParticipants: number,
  invitedUsers: string[]
): Promise<VideoSchedule> {
  return videoConference.scheduleVideoSession(hostId, title, description, scheduledTime, duration, maxParticipants, invitedUsers);
}

/**
 * Récupère les sessions programmées
 */
export async function getScheduledSessions(userId: string): Promise<VideoSchedule[]> {
  return videoConference.getScheduledSessions(userId);
}
