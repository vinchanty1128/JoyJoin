/**
 * 12个社交氛围原型性格测评题库
 * 10题精准区分：开心柯基、太阳鸡、夸夸豚、机智狐、淡定海豚、织网蛛、暖心熊、灵感章鱼、沉思猫头鹰、定心大象、稳如龟、隐身猫
 */

export interface QuestionOption {
  value: string;
  text: string;
  roleMapping: string; // 映射到12个原型之一
}

export interface Question {
  id: number;
  category: string;
  questionText: string;
  scenarioText?: string;
  questionType: "single" | "dual";
  options: QuestionOption[];
}

export const personalityQuestions: Question[] = [
  {
    id: 1,
    category: "社交启动方式",
    scenarioText: "🎉 周五晚上，你走进一家温馨的私房菜餐厅，5个陌生人正在等你参加小聚...",
    questionText: "刚进门，你最自然的反应是？",
    questionType: "single",
    options: [
      { value: "A", text: "主动自我介绍，用幽默开场让大家笑起来！", roleMapping: "开心柯基" },
      { value: "B", text: "微笑着环顾四周，等待合适时机加入对话。", roleMapping: "淡定海豚" },
      { value: "C", text: "找个位子坐下，安静观察大家的互动节奏。", roleMapping: "隐身猫" },
      { value: "D", text: "主动询问\"大家怎么认识的\"，建立连接。", roleMapping: "织网蛛" },
    ],
  },
  
  {
    id: 2,
    category: "能量释放模式",
    scenarioText: "💬 话题聊起来了，有人提到最近发现的一家神秘咖啡馆...",
    questionText: "听到这个新鲜事，你的反应是？",
    questionType: "single",
    options: [
      { value: "A", text: "\"哇！在哪里？我们组团去打卡吧！\" 立马充满行动力", roleMapping: "机智狐" },
      { value: "B", text: "\"听起来不错呀～\" 微笑回应，给ta鼓励和肯定", roleMapping: "夸夸豚" },
      { value: "C", text: "\"我之前也去过类似的，那次...\" 分享自己的相关故事", roleMapping: "暖心熊" },
      { value: "D", text: "\"咖啡馆的设计理念是什么？\" 思考背后的深层逻辑", roleMapping: "沉思猫头鹰" },
    ],
  },
  
  {
    id: 3,
    category: "情绪调节角色",
    scenarioText: "😔 气氛突然安静下来，有人分享了一段失落的经历...",
    questionText: "面对这个情绪低点，你会？",
    questionType: "dual",
    options: [
      { value: "A", text: "\"我懂你的感受...\" 用共情的方式深度倾听", roleMapping: "暖心熊" },
      { value: "B", text: "\"没事的，我们都支持你！\" 温暖鼓励ta继续前进", roleMapping: "太阳鸡" },
      { value: "C", text: "默默递纸巾，用安静的陪伴表达支持", roleMapping: "隐身猫" },
      { value: "D", text: "适时调整话题节奏，避免氛围过于沉重", roleMapping: "淡定海豚" },
    ],
  },
  
  {
    id: 4,
    category: "思维表达方式",
    scenarioText: "🌟 有人抛出一个开放性问题：\"如果能重新设计一座城市，你会怎么做？\"",
    questionText: "你的大脑会？",
    questionType: "dual",
    options: [
      { value: "A", text: "瞬间联想到10个脑洞：\"空中花园！地下图书馆！移动咖啡车！\"", roleMapping: "灵感章鱼" },
      { value: "B", text: "思考核心原则：\"首先要定义'好城市'的标准...\"", roleMapping: "沉思猫头鹰" },
      { value: "C", text: "连接不同人的想法：\"A的想法+B的观点可以结合！\"", roleMapping: "织网蛛" },
      { value: "D", text: "关注实操：\"预算多少？时间表怎么安排？\"", roleMapping: "定心大象" },
    ],
  },
  
  {
    id: 5,
    category: "冲突应对策略",
    scenarioText: "🤔 两个人就\"远程办公是否高效\"开始争论，气氛有点紧张...",
    questionText: "你会如何应对？",
    questionType: "single",
    options: [
      { value: "A", text: "\"哎呀别争啦～咱们换个轻松话题吧！\" 用幽默化解", roleMapping: "开心柯基" },
      { value: "B", text: "\"两边都有道理，也许问题在于...\" 寻找平衡点", roleMapping: "淡定海豚" },
      { value: "C", text: "保持沉默，等待争论自然结束再说话", roleMapping: "稳如龟" },
      { value: "D", text: "\"让我们换个角度看...\" 提供第三方视角", roleMapping: "灵感章鱼" },
    ],
  },
  
  {
    id: 6,
    category: "贡献价值方式",
    scenarioText: "💡 话题转向\"大家今年最大的成长是什么\"...",
    questionText: "你倾向于贡献什么？",
    questionType: "dual",
    options: [
      { value: "A", text: "\"我发现了一个新视角...\" 分享独特的思考洞察", roleMapping: "稳如龟" },
      { value: "B", text: "\"你们都好棒！我也想...\" 鼓掌并分享正能量", roleMapping: "夸夸豚" },
      { value: "C", text: "\"说到成长，我想起...\" 讲述一个感人的故事", roleMapping: "暖心熊" },
      { value: "D", text: "\"我觉得最重要的是保持稳定...\" 提供可靠的建议", roleMapping: "定心大象" },
    ],
  },
  
  {
    id: 7,
    category: "社交舒适区",
    scenarioText: "🎯 聚会进行到一半，你感觉最舒服的状态是？",
    questionText: "以下哪种描述最符合你？",
    questionType: "single",
    options: [
      { value: "A", text: "成为焦点，带动全场节奏，感觉活力满满！", roleMapping: "开心柯基" },
      { value: "B", text: "散发温暖能量，让每个人都感到被关注和照顾", roleMapping: "太阳鸡" },
      { value: "C", text: "发现有趣的人，挖掘新的体验和信息", roleMapping: "机智狐" },
      { value: "D", text: "做个安静的观察者，享受旁观的自在", roleMapping: "隐身猫" },
    ],
  },
  
  {
    id: 8,
    category: "深度交流偏好",
    scenarioText: "🧠 有人提议玩\"灵魂拷问\"游戏，每人回答一个深度问题...",
    questionText: "你的态度是？",
    questionType: "single",
    options: [
      { value: "A", text: "\"好玩！但问题别太沉重哦～\" 喜欢轻松的深度", roleMapping: "夸夸豚" },
      { value: "B", text: "\"终于！我就等深度对话呢！\" 渴望哲学讨论", roleMapping: "沉思猫头鹰" },
      { value: "C", text: "\"可以呀，我来帮大家找到共鸣点～\" 连接不同的答案", roleMapping: "织网蛛" },
      { value: "D", text: "\"我听大家的，不太想做第一个回答的人...\" 观望为主", roleMapping: "稳如龟" },
    ],
  },
  
  {
    id: 9,
    category: "社交能量消耗",
    scenarioText: "⚡ 聚会结束后，你的状态是？",
    questionText: "回到家，你的感受是？",
    questionType: "single",
    options: [
      { value: "A", text: "\"好累但好爽！今晚聊得太开心了！\" 能量消耗但满足", roleMapping: "开心柯基" },
      { value: "B", text: "\"感觉很充实～大家都很温暖～\" 能量平稳，心情愉悦", roleMapping: "太阳鸡" },
      { value: "C", text: "\"嗯，还不错，但需要独处充电一会儿...\" 轻度疲惫", roleMapping: "定心大象" },
      { value: "D", text: "\"终于可以安静了...\" 社交电量彻底耗尽", roleMapping: "隐身猫" },
    ],
  },
  
  {
    id: 10,
    category: "核心社交动机",
    scenarioText: "🎁 如果朋友要用一句话介绍你给新朋友...",
    questionText: "你希望ta怎么说？",
    questionType: "single",
    options: [
      { value: "A", text: "\"Ta是个人间小太阳，和ta在一起很温暖！\"", roleMapping: "太阳鸡" },
      { value: "B", text: "\"Ta特别会玩，总能发现有趣的新东西！\"", roleMapping: "机智狐" },
      { value: "C", text: "\"Ta的脑洞超大，创意无穷无尽！\"", roleMapping: "灵感章鱼" },
      { value: "D", text: "\"Ta很靠谱，关键时刻特别稳！\"", roleMapping: "定心大象" },
    ],
  },
];

/**
 * 角色映射表（用于后端计分）
 * 每个问题ID对应每个选项值到角色的映射
 */
export const roleMapping: Record<number, Record<string, string>> = {
  1: { A: "开心柯基", B: "淡定海豚", C: "隐身猫", D: "织网蛛" },
  2: { A: "机智狐", B: "夸夸豚", C: "暖心熊", D: "沉思猫头鹰" },
  3: { A: "暖心熊", B: "太阳鸡", C: "隐身猫", D: "淡定海豚" },
  4: { A: "灵感章鱼", B: "沉思猫头鹰", C: "织网蛛", D: "定心大象" },
  5: { A: "开心柯基", B: "淡定海豚", C: "稳如龟", D: "灵感章鱼" },
  6: { A: "稳如龟", B: "夸夸豚", C: "暖心熊", D: "定心大象" },
  7: { A: "开心柯基", B: "太阳鸡", C: "机智狐", D: "隐身猫" },
  8: { A: "夸夸豚", B: "沉思猫头鹰", C: "织网蛛", D: "稳如龟" },
  9: { A: "开心柯基", B: "太阳鸡", C: "定心大象", D: "隐身猫" },
  10: { A: "太阳鸡", B: "机智狐", C: "灵感章鱼", D: "定心大象" },
};

/**
 * 检查题库覆盖度
 * 确保12个原型都有足够的题目覆盖
 */
export function validateCoverage(): Record<string, number> {
  const coverage: Record<string, number> = {};
  
  personalityQuestions.forEach(q => {
    q.options.forEach(opt => {
      coverage[opt.roleMapping] = (coverage[opt.roleMapping] || 0) + 1;
    });
  });
  
  return coverage;
}

// 验证覆盖度（开发环境自动检查）
if (import.meta.env.DEV) {
  const coverage = validateCoverage();
  console.log("📊 12个原型题库覆盖度:", coverage);
  
  const allArchetypes = [
    "开心柯基", "太阳鸡", "夸夸豚", "机智狐",
    "淡定海豚", "织网蛛", "暖心熊", "灵感章鱼",
    "沉思猫头鹰", "定心大象", "稳如龟", "隐身猫"
  ];
  
  const missing = allArchetypes.filter(a => !coverage[a] || coverage[a] < 2);
  if (missing.length > 0) {
    console.warn("⚠️ 以下原型覆盖不足（少于2题）:", missing);
  }
}
