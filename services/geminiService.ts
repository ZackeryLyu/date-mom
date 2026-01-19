import { GoogleGenAI } from "@google/genai";
import { MomPersonality } from "../types";
import { PERSONALITY_DESCRIPTIONS } from "../constants";

// Initialize Gemini Client
// IMPORTANT: process.env.API_KEY is assumed to be available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Generates a response from "Mom" based on her personality and the check-in event.
 */
export const generateMomResponse = async (personality: MomPersonality, streak: number): Promise<string> => {
  const personalityDesc = PERSONALITY_DESCRIPTIONS[personality];
  
  const prompt = `
    你现在扮演一位中国的妈妈。你的孩子刚刚在一个叫“约了，妈”的APP上打卡，告诉你今天去约会了。
    
    目前的打卡连续天数是：${streak}天。
    
    你的性格设定是：${personality}。具体表现为：${personalityDesc}
    
    请根据你的性格设定，给孩子回复一条微信消息。
    要求：
    1. 口语化，像微信聊天的语气。
    2. 字数在60字以内。
    3. 如果连续打卡天数很高（超过3天），表示惊讶或高度赞赏（或高度怀疑，取决于性格）。
    4. 这是一个幽默的APP，回复可以带点梗或者好玩一点。
    
    直接输出回复内容，不要带引号。
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Fast response
      }
    });

    return response.text || "妈妈正在打麻将，没空回你（AI生成失败）";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "哎呀，妈妈的手机信号不好，刚才说什么来着？（网络错误）";
  }
};

/**
 * Generates a "Fake Date Plan" just for fun/context if the user wants to see what they "did".
 */
export const generateDateIdea = async (): Promise<string> => {
  const prompt = `
    生成一个简短、浪漫且符合中国当下年轻人潮流的约会活动描述。
    例如：“去外滩吹风吃冰淇淋”、“去猫咖撸猫喝咖啡”。
    只输出一句话，不超过20个字。
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "去公园散步";
  } catch (error) {
    return "去看电影";
  }
};