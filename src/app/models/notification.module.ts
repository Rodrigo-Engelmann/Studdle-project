import { DialogSize } from '../components/enums/dialog.enums';
import { UserNotification } from '../components/services/user-notifications/user-notifications.service';

export interface NotificationsDialogConfig {
  title?: string;
  size?: DialogSize;
}

export interface NotificationsResult {
  selected?: UserNotification;
}

export interface CommentThreadDialogConfig {
  commentId: number;
  title?: string;
  size?: DialogSize;
}