export const ItemTemplateType = {
  NICKNAME_COLOR: 'nickname_color',
  NICKNAME_ICON: 'nickname_icon',
  AVATAR_FRAME: 'avatar_frame',
  GUARD: 'guard',
  SHIELD: 'shield',
  REWARD_DOUBLING: 'reward_doubling',
  COOLDOWN_HALVING: 'cooldown_halving',
} as const;

export type ItemTemplateType = typeof ItemTemplateType[keyof typeof ItemTemplateType];

export const ItemTemplateTypeLabels: Record<ItemTemplateType, string> = {
  [ItemTemplateType.NICKNAME_COLOR]: 'Цвет ника',
  [ItemTemplateType.NICKNAME_ICON]: 'Иконка ника',
  [ItemTemplateType.AVATAR_FRAME]: 'Рамка аватара',
  [ItemTemplateType.GUARD]: 'Страж',
  [ItemTemplateType.SHIELD]: 'Щит',
  [ItemTemplateType.REWARD_DOUBLING]: 'Удвоение награды',
  [ItemTemplateType.COOLDOWN_HALVING]: 'Сокращение перезарядки',
};
