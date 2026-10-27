import { Comment } from '../services/comments/comments.service';

export interface MentionMaps {
  idByName: Map<string, number>;
  nameById: Map<number, string>;
}

export function buildMentionMaps(
  comments: Comment[],
  extra?: { id?: number; user_name?: string } | null,
): MentionMaps {
  const idByName = new Map<string, number>();
  const nameById = new Map<number, string>();

  const register = (id?: number, userName?: string) => {
    if (id == null || !userName) return;

    idByName.set(userName.toLowerCase(), id);
    nameById.set(id, userName);
  };

  for (const comment of comments) register(comment.user?.id, comment.user?.user_name);

  register(extra?.id, extra?.user_name);

  return { idByName, nameById };
}

export function encodeMentions(text: string, maps: MentionMaps): string {
  let result = text;

  const names = [...maps.idByName.keys()].sort((a, b) => b.length - a.length);

  for (const name of names) {
    const id = maps.idByName.get(name)!;
    const pattern = new RegExp(`@${escapeRegex(name)}(?!\\w)`, 'gi');
    result = result.replace(pattern, `@[${id}]`);
  }

  return result;
}

export function decodeMentions(content: string, maps: MentionMaps): string {
  return content.replace(
    /@\[(\d+)\]/g,
    (_, id: string) => `@${maps.nameById.get(Number(id)) ?? 'usuário'}`,
  );
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
