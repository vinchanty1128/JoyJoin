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
    scenarioText: "🎉 朋友生日聚会，你走进包厢，发现有5个人你都不认识...",
    questionText: "刚进门，你最自然的反应是？",
    questionType: "single",
    options: [
      { value: "A", text: "主动自我介绍，用幽默开场让大家笑起来！", roleMapping: "开心柯基" },
      { value: "B", text: "微笑着环顾四周，等待合适时机加入对话。", roleMapping: "淡定海豚" },
      { value: "C", text: "找个位子坐下，安静观察大家的互动节奏。", roleMapping: "隐身猫" },
      { value: "D", text: "主动询问\"大家怎么认识寿星的\"，建立连接。", roleMapping: "织网蛛" },
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
    scenarioText: "🌟 大家在讨论：\"如果能开一家梦想小店，你会开什么？\"",
    questionText: "你的大脑会？",
    questionType: "dual",
    options: [
      { value: "A", text: "瞬间冒出10个点子：\"猫咖！深夜书店！移动奶茶车！\"", roleMapping: "灵感章鱼" },
      { value: "B", text: "思考核心原则：\"首先要想清楚目标客户是谁...\"", roleMapping: "沉思猫头鹰" },
      { value: "C", text: "连接不同人的想法：\"A的想法+B的观点可以结合！\"", roleMapping: "织网蛛" },
      { value: "D", text: "关注实操：\"租金多少？需要多少启动资金？\"", roleMapping: "定心大象" },
    ],
  },
  
  {
    id: 5,
    category: "冲突应对策略",
    scenarioText: "🤔 两个人就\"奶茶该喝全糖还是少糖\"开始认真争论，气氛有点紧张...",
    questionText: "你会如何应对？",
    questionType: "single",
    options: [
      { value: "A", text: "\"哎呀别争啦～咱们各买各的不就好了！\" 用幽默化解", roleMapping: "开心柯基" },
      { value: "B", text: "\"两边都有道理，也许可以点半糖试试...\" 寻找平衡点", roleMapping: "淡定海豚" },
      { value: "C", text: "保持沉默，等待争论自然结束再说话", roleMapping: "稳如龟" },
      { value: "D", text: "\"换个角度想，其实口味是很主观的...\" 提供第三方视角", roleMapping: "灵感章鱼" },
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

/**
 * 补测题库 - 用于精准区分相似原型
 * 当基础测试的top2原型分数差距<3分时，从这里选择针对性题目
 */
export const supplementaryQuestions: Question[] = [
  // 1. 开心柯基 vs 太阳鸡 - 区分点：搞笑活泼 vs 温暖稳定
  {
    id: 101,
    category: "能量表达风格",
    scenarioText: "🎤 KTV聚会，大家点完歌在聊天...",
    questionText: "你更可能做什么？",
    questionType: "single",
    options: [
      { value: "A", text: "主动点搞笑歌曲，带动全场一起嗨！", roleMapping: "开心柯基" },
      { value: "B", text: "温柔地鼓励害羞的朋友：\"你唱得很好听，来一首吧～\"", roleMapping: "太阳鸡" },
    ],
  },
  {
    id: 102,
    category: "社交节奏偏好",
    scenarioText: "🎊 聚会进行到后半段，气氛有点疲惫...",
    questionText: "你的反应是？",
    questionType: "single",
    options: [
      { value: "A", text: "\"来来来！玩个游戏醒醒神！\" 提议破冰活动", roleMapping: "开心柯基" },
      { value: "B", text: "\"大家都辛苦啦～要不要吃点甜品休息一下？\" 温柔照顾", roleMapping: "太阳鸡" },
    ],
  },

  // 2. 淡定海豚 vs 织网蛛 - 区分点：氛围平衡 vs 人际连接
  {
    id: 103,
    category: "社交关注焦点",
    scenarioText: "🍜 一群人吃饭，发现有两个人全程没怎么说话...",
    questionText: "你会怎么做？",
    questionType: "single",
    options: [
      { value: "A", text: "观察整体氛围，适时调整话题让所有人都能参与", roleMapping: "淡定海豚" },
      { value: "B", text: "主动跟这两个人聊天，问\"你是做什么的？\"建立连接", roleMapping: "织网蛛" },
    ],
  },
  {
    id: 104,
    category: "冲突处理方式",
    scenarioText: "💬 微信群里两个人因为选日期起了小争执...",
    questionText: "你的第一反应是？",
    questionType: "single",
    options: [
      { value: "A", text: "私聊其中一方：\"要不咱们妥协一下？\" 协调平衡", roleMapping: "淡定海豚" },
      { value: "B", text: "群里@第三个人：\"XX你觉得呢？\" 引入更多视角", roleMapping: "织网蛛" },
    ],
  },

  // 3. 沉思猫头鹰 vs 稳如龟 - 区分点：主动思考分享 vs 沉默观察
  {
    id: 105,
    category: "发言频率",
    scenarioText: "🧠 大家在讨论一个有深度的话题...",
    questionText: "你的参与方式是？",
    questionType: "single",
    options: [
      { value: "A", text: "频繁发言，提出尖锐问题：\"但这个逻辑有个漏洞...\"", roleMapping: "沉思猫头鹰" },
      { value: "B", text: "大部分时间沉默思考，只在关键时刻说一句总结", roleMapping: "稳如龟" },
    ],
  },
  {
    id: 106,
    category: "思考表达风格",
    scenarioText: "💡 有人问你对某个社会现象的看法...",
    questionText: "你会？",
    questionType: "single",
    options: [
      { value: "A", text: "马上分析：\"这背后反映了三个问题...\" 展开深度论述", roleMapping: "沉思猫头鹰" },
      { value: "B", text: "停顿一下：\"嗯...我再想想\" 不急于表达", roleMapping: "稳如龟" },
    ],
  },

  // 4. 机智狐 vs 灵感章鱼 - 区分点：行动探索 vs 创意发散
  {
    id: 107,
    category: "新鲜事物偏好",
    scenarioText: "🎨 朋友推荐了一个新开的展览...",
    questionText: "你的兴奋点在哪？",
    questionType: "single",
    options: [
      { value: "A", text: "\"哇！在哪里？我们周末就去！\" 立刻规划行动", roleMapping: "机智狐" },
      { value: "B", text: "\"好有意思！这让我想到可以做个...\" 脑洞联想创意", roleMapping: "灵感章鱼" },
    ],
  },
  {
    id: 108,
    category: "信息处理方式",
    scenarioText: "📱 刷到一个新奇的生活方式分享...",
    questionText: "你会？",
    questionType: "single",
    options: [
      { value: "A", text: "\"我也要试试！\" 收藏并计划下周实践", roleMapping: "机智狐" },
      { value: "B", text: "\"如果把这个和那个结合...\" 产生新的创意灵感", roleMapping: "灵感章鱼" },
    ],
  },

  // 5. 暖心熊 vs 夸夸豚 - 区分点：深度共情 vs 热情鼓励
  {
    id: 109,
    category: "情感回应方式",
    scenarioText: "😢 朋友说\"我最近压力好大...\"",
    questionText: "你会怎么回应？",
    questionType: "single",
    options: [
      { value: "A", text: "\"我懂...上次我也经历过类似的...\" 深度共情并分享故事", roleMapping: "暖心熊" },
      { value: "B", text: "\"你已经很棒了！加油！我相信你可以的！\" 热情鼓励", roleMapping: "夸夸豚" },
    ],
  },
  {
    id: 110,
    category: "支持表达方式",
    scenarioText: "🎯 朋友分享了一个小成就...",
    questionText: "你的反应是？",
    questionType: "single",
    options: [
      { value: "A", text: "\"我知道你为此付出了多少努力...\" 看到背后的故事", roleMapping: "暖心熊" },
      { value: "B", text: "\"哇！太厉害了！你简直是天才！\" 夸张式赞美", roleMapping: "夸夸豚" },
    ],
  },

  // 6. 定心大象 vs 淡定海豚 - 区分点：被动稳定 vs 主动平衡
  {
    id: 111,
    category: "群体角色定位",
    scenarioText: "🎭 聚会上大家意见分歧，气氛有点乱...",
    questionText: "你倾向于？",
    questionType: "single",
    options: [
      { value: "A", text: "保持稳定存在，给大家安全感，不主动介入", roleMapping: "定心大象" },
      { value: "B", text: "主动协调：\"我们先听听A的想法，再听B的...\"", roleMapping: "淡定海豚" },
    ],
  },
  {
    id: 112,
    category: "应对变化态度",
    scenarioText: "📍 原定计划临时改了地点和时间...",
    questionText: "你的反应是？",
    questionType: "single",
    options: [
      { value: "A", text: "\"没事，我都可以～\" 包容接纳变化", roleMapping: "定心大象" },
      { value: "B", text: "\"那我们看看怎么调整比较好...\" 主动协调方案", roleMapping: "淡定海豚" },
    ],
  },

  // 7. 隐身猫 vs 稳如龟 - 区分点：完全隐身 vs 低频但有质量的发言
  {
    id: 113,
    category: "存在感管理",
    scenarioText: "💬 群聊很热闹，大家都在发言...",
    questionText: "你通常会？",
    questionType: "single",
    options: [
      { value: "A", text: "全程潜水，偶尔点个赞表示在看", roleMapping: "隐身猫" },
      { value: "B", text: "观察很久，最后发一条高质量总结", roleMapping: "稳如龟" },
    ],
  },
  {
    id: 114,
    category: "自我表达倾向",
    scenarioText: "🎤 有人点名问你的想法...",
    questionText: "你的内心独白是？",
    questionType: "single",
    options: [
      { value: "A", text: "\"啊...被cue到了...\" 希望快速应付过去", roleMapping: "隐身猫" },
      { value: "B", text: "\"嗯，我思考了一下...\" 认真分享自己的洞察", roleMapping: "稳如龟" },
    ],
  },

  // 8. 开心柯基 vs 机智狐 - 区分点：社交能量释放 vs 好奇探索
  {
    id: 115,
    category: "周末规划",
    scenarioText: "🌅 周五晚上，突然有一整个周末空闲...",
    questionText: "你最想做什么？",
    questionType: "single",
    options: [
      { value: "A", text: "\"召集朋友开派对！\" 社交聚会充电", roleMapping: "开心柯基" },
      { value: "B", text: "\"去探索那家新开的店！\" 发现新鲜体验", roleMapping: "机智狐" },
    ],
  },

  // 9. 太阳鸡 vs 暖心熊 - 区分点：普照温暖 vs 深度陪伴
  {
    id: 116,
    category: "关怀范围",
    scenarioText: "👥 10人聚会，你注意到一个人情绪低落...",
    questionText: "你会？",
    questionType: "single",
    options: [
      { value: "A", text: "提升整体氛围让大家都开心，包括ta", roleMapping: "太阳鸡" },
      { value: "B", text: "找机会单独陪伴ta，深度倾听ta的烦恼", roleMapping: "暖心熊" },
    ],
  },

  // 10. 织网蛛 vs 机智狐 - 区分点：连接人 vs 探索事
  {
    id: 117,
    category: "社交动机",
    scenarioText: "🎪 有个跨界沙龙活动，各行业的人都有...",
    questionText: "你最兴奋的点是？",
    questionType: "single",
    options: [
      { value: "A", text: "\"可以认识好多有趣的人！\" 建立人脉网络", roleMapping: "织网蛛" },
      { value: "B", text: "\"可以了解好多新领域！\" 获取新知识", roleMapping: "机智狐" },
    ],
  },

  // 11. 灵感章鱼 vs 沉思猫头鹰 - 区分点：发散创意 vs 逻辑分析
  {
    id: 118,
    category: "问题解决方式",
    scenarioText: "🧩 朋友遇到职业选择难题...",
    questionText: "你会提供什么帮助？",
    questionType: "single",
    options: [
      { value: "A", text: "\"哇！你可以试试ABC，还可以...\" 提供10个脑洞方向", roleMapping: "灵感章鱼" },
      { value: "B", text: "\"我们先分析核心问题是什么...\" 逻辑拆解", roleMapping: "沉思猫头鹰" },
    ],
  },

  // 12. 定心大象 vs 稳如龟 - 区分点：温暖包容 vs 冷静观察
  {
    id: 119,
    category: "稳定性来源",
    scenarioText: "🌊 团队遇到挫折，气氛低迷...",
    questionText: "你的存在感体现在？",
    questionType: "single",
    options: [
      { value: "A", text: "\"没事的，我们一起度过～\" 温暖的支持包容", roleMapping: "定心大象" },
      { value: "B", text: "保持冷静，观察局势，等待合适时机发言", roleMapping: "稳如龟" },
    ],
  },

  // 13. 夸夸豚 vs 太阳鸡 - 区分点：主动赞美 vs 散发温暖
  {
    id: 120,
    category: "正能量表达",
    scenarioText: "🎨 朋友展示了一幅画作...",
    questionText: "你会？",
    questionType: "single",
    options: [
      { value: "A", text: "\"哇！太棒了！你太有才华了！\" 热情赞美", roleMapping: "夸夸豚" },
      { value: "B", text: "\"画得真好～\" 温柔微笑，散发肯定能量", roleMapping: "太阳鸡" },
    ],
  },
];

/**
 * 补测题映射表
 */
export const supplementaryRoleMapping: Record<number, Record<string, string>> = {
  101: { A: "开心柯基", B: "太阳鸡" },
  102: { A: "开心柯基", B: "太阳鸡" },
  103: { A: "淡定海豚", B: "织网蛛" },
  104: { A: "淡定海豚", B: "织网蛛" },
  105: { A: "沉思猫头鹰", B: "稳如龟" },
  106: { A: "沉思猫头鹰", B: "稳如龟" },
  107: { A: "机智狐", B: "灵感章鱼" },
  108: { A: "机智狐", B: "灵感章鱼" },
  109: { A: "暖心熊", B: "夸夸豚" },
  110: { A: "暖心熊", B: "夸夸豚" },
  111: { A: "定心大象", B: "淡定海豚" },
  112: { A: "定心大象", B: "淡定海豚" },
  113: { A: "隐身猫", B: "稳如龟" },
  114: { A: "隐身猫", B: "稳如龟" },
  115: { A: "开心柯基", B: "机智狐" },
  116: { A: "太阳鸡", B: "暖心熊" },
  117: { A: "织网蛛", B: "机智狐" },
  118: { A: "灵感章鱼", B: "沉思猫头鹰" },
  119: { A: "定心大象", B: "稳如龟" },
  120: { A: "夸夸豚", B: "太阳鸡" },
};

/**
 * 获取针对特定原型对的补测题
 * @param archetype1 第一个原型
 * @param archetype2 第二个原型
 * @param count 需要的题目数量（默认3题）
 */
export function getSupplementaryQuestions(
  archetype1: string,
  archetype2: string,
  count: number = 3
): Question[] {
  const relevantQuestions = supplementaryQuestions.filter(q => {
    const options = q.options.map(opt => opt.roleMapping);
    return (
      (options.includes(archetype1) && options.includes(archetype2)) ||
      (options.includes(archetype2) && options.includes(archetype1))
    );
  });

  // 随机打乱并取前count个
  const shuffled = relevantQuestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// 验证覆盖度（开发环境自动检查）
if (import.meta.env.DEV) {
  const coverage = validateCoverage();
  console.log("📊 12个原型基础题库覆盖度:", coverage);
  
  const allArchetypes = [
    "开心柯基", "太阳鸡", "夸夸豚", "机智狐",
    "淡定海豚", "织网蛛", "暖心熊", "灵感章鱼",
    "沉思猫头鹰", "定心大象", "稳如龟", "隐身猫"
  ];
  
  const missing = allArchetypes.filter(a => !coverage[a] || coverage[a] < 2);
  if (missing.length > 0) {
    console.warn("⚠️ 以下原型覆盖不足（少于2题）:", missing);
  }

  // 测试补测题筛选
  console.log("🎯 补测题库测试:");
  console.log("柯基vs太阳鸡:", getSupplementaryQuestions("开心柯基", "太阳鸡", 3).length, "题");
  console.log("海豚vs蛛:", getSupplementaryQuestions("淡定海豚", "织网蛛", 3).length, "题");
}
