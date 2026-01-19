import { MomPersonality } from './types';

export const APP_STORAGE_KEY = 'yue_le_ma_v1';

export const PERSONALITY_DESCRIPTIONS: Record<MomPersonality, string> = {
  [MomPersonality.NAGGING]: "喜欢催婚，担心你孤独终老，每一句话都离不开找对象。",
  [MomPersonality.SWEET]: "非常支持你，只要你开心就好，说话很温柔，给很多鼓励。",
  [MomPersonality.DRAMATIC]: "反应夸张，动不动就感动得流泪，或者惊叹不已，仿佛你做了一件惊天动地的大事。",
  [MomPersonality.SKEPTICAL]: "不相信你真的去约会了，觉得你在骗她，会像侦探一样盘问细节。",
};

export const MOCK_REPLIES = [
  "真的吗？对方多高？多大？哪里人？照片发来我看看！",
  "太好了宝贝！妈妈终于放心了，记得要表现得大方一点哦。",
  "哎哟我的天哪！祖坟冒青烟了！我儿子/女儿终于开窍了！",
  "是不是又是跟同事吃饭骗我说是约会？把小票发给我看看！"
];