import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, Volume2, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface VoiceQuizProps {
  onComplete: (results: any) => void;
  onSkip?: () => void;
  coachGender: "female" | "male";
}

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "描述一下你理想的周末活动",
    hint: "例如：和朋友聚会、独自阅读、户外探险等",
    duration: 30,
    coachPrompt: {
      female: "嗨！让我们开始吧。请告诉我，你理想的周末活动是什么样的？",
      male: "嘿！我们开始吧。说说你理想的周末是怎么度过的？"
    }
  },
  {
    id: 2,
    question: "当遇到新朋友时，你通常如何开始对话？",
    hint: "描述你的社交风格和习惯",
    duration: 30,
    coachPrompt: {
      female: "很好！现在告诉我，当你遇到新朋友时，通常怎么开始聊天呢？",
      male: "不错！接下来，遇到新朋友的时候，你一般怎么打开话题？"
    }
  },
  {
    id: 3,
    question: "你更喜欢计划好的活动，还是随性而为？为什么？",
    hint: "分享你的决策方式和偏好",
    duration: 30,
    coachPrompt: {
      female: "明白了。那你是喜欢提前计划，还是更享受即兴的感觉？",
      male: "了解。你更喜欢按计划来，还是随性一点？说说你的想法。"
    }
  },
  {
    id: 4,
    question: "当朋友需要建议时，你通常会怎么做？",
    hint: "描述你的倾听和支持方式",
    duration: 30,
    coachPrompt: {
      female: "好的。当朋友向你寻求建议时，你会怎么回应呢？",
      male: "明白。如果朋友来找你聊问题，你一般会怎么做？"
    }
  },
  {
    id: 5,
    question: "什么样的活动或话题最能激发你的热情？",
    hint: "分享你的兴趣和激情所在",
    duration: 30,
    coachPrompt: {
      female: "最后一个问题啦！什么事情最能让你感到兴奋和充满热情？",
      male: "最后一题了！说说什么能让你真正感到兴奋？"
    }
  }
];

export default function VoiceQuiz({ onComplete, onSkip, coachGender }: VoiceQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCoachSpeaking, setIsCoachSpeaking] = useState(false);
  const [coachAudioTime, setCoachAudioTime] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [showIntro, setShowIntro] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const coachTimerRef = useRef<NodeJS.Timeout | null>(null);

  const coachName = coachGender === "female" ? "小周" : "Ben";
  const coachGreeting = coachGender === "female" 
    ? "你好，我是你的好姐妹小周" 
    : "你好，我是你的好兄弟Ben";

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (coachTimerRef.current) clearInterval(coachTimerRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    if (!showIntro && currentQuestion < QUIZ_QUESTIONS.length) {
      playCoachPrompt();
    }
  }, [currentQuestion, showIntro]);

  const playCoachPrompt = async () => {
    const question = QUIZ_QUESTIONS[currentQuestion];
    const prompt = question.coachPrompt[coachGender];
    
    setIsCoachSpeaking(true);
    setCoachAudioTime(0);
    
    // In real implementation, this would call OpenAI TTS API
    // For demo, simulate audio playback duration based on text length
    const estimatedDuration = Math.min(8, prompt.length * 0.08);
    
    coachTimerRef.current = setInterval(() => {
      setCoachAudioTime(prev => {
        if (prev >= estimatedDuration) {
          if (coachTimerRef.current) clearInterval(coachTimerRef.current);
          setIsCoachSpeaking(false);
          return estimatedDuration;
        }
        return prev + 0.1;
      });
    }, 100);
  };

  const startIntro = () => {
    setShowIntro(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= QUIZ_QUESTIONS[currentQuestion].duration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResponse = `关于问题 ${currentQuestion + 1} 的回答`;
      const newResponses = [...responses, mockResponse];
      setResponses(newResponses);

      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        await analyzeResponses(newResponses);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('处理音频时出错，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeResponses = async (allResponses: string[]) => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const results = {
        traits: [
          { name: "亲和力", score: 8, maxScore: 10 },
          { name: "开放性", score: 7, maxScore: 10 },
          { name: "责任心", score: 6, maxScore: 10 },
          { name: "外向性", score: 5, maxScore: 10 },
          { name: "情绪稳定性", score: 8, maxScore: 10 }
        ],
        challenges: [
          "可能对突然的计划变更感到不适",
          "在大型社交场合中可能需要独处时间恢复能量"
        ],
        idealMatch: "你会在与同样重视深度对话、欣赏计划性活动但也能享受偶尔即兴时刻的朋友相处中感到愉快。寻找那些能理解你需要独处时间、同时也享受有意义社交互动的人。"
      };

      onComplete(results);
    } finally {
      setIsProcessing(false);
    }
  };

  if (showIntro) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="p-8 flex flex-col items-center justify-center space-y-6 min-h-[400px]">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center">
              <Volume2 className="h-12 w-12 text-primary" />
            </div>
            <div className="absolute -inset-2 rounded-full bg-primary/10 animate-pulse" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-display font-bold">{coachName}，AI教练</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {coachGreeting}。我会用语音引导你完成测评，让我们开始吧！
            </p>
          </div>

          <Button 
            size="lg"
            onClick={startIntro}
            data-testid="button-start-with-coach"
            className="mt-4"
          >
            开始对话
          </Button>

          {onSkip && (
            <Button 
              variant="ghost"
              onClick={onSkip}
              data-testid="button-skip-coach"
            >
              跳过语音引导
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + (isProcessing ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100;

  if (isProcessing) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-8 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground text-center">
            {currentQuestion === QUIZ_QUESTIONS.length - 1 
              ? "正在分析您的性格特质..." 
              : "正在处理您的回答..."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>问题 {currentQuestion + 1} / {QUIZ_QUESTIONS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{coachName} 教练</span>
            </div>
            {isCoachSpeaking && (
              <Badge variant="secondary" className="gap-1.5 text-xs">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                {coachAudioTime.toFixed(1)}s
              </Badge>
            )}
          </div>

          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
              {isCoachSpeaking ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-32 w-48 rounded-full border-4 border-primary/40 animate-pulse" 
                         style={{ 
                           animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                           transform: `scale(${1 + Math.sin(coachAudioTime * 3) * 0.1})`
                         }} 
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-40 w-56 rounded-full border-2 border-primary/20 animate-pulse" 
                         style={{ 
                           animationDelay: '0.2s',
                           transform: `scale(${1 + Math.sin(coachAudioTime * 3 + 0.5) * 0.15})`
                         }} 
                    />
                  </div>
                </>
              ) : (
                <div className="h-32 w-48 rounded-full border-4 border-muted" />
              )}
            </div>

            <div className="text-center space-y-3 w-full">
              <h3 className="font-display font-bold text-lg px-4">{question.question}</h3>
              <p className="text-xs text-muted-foreground px-4">{question.hint}</p>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4 pt-4">
            {isRecording ? (
              <>
                <div className="relative">
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-20 w-20 rounded-full"
                    onClick={stopRecording}
                    data-testid="button-stop-recording"
                  >
                    <Square className="h-8 w-8" />
                  </Button>
                  <div className="absolute -inset-1 rounded-full bg-destructive/20 animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <Badge variant="destructive" className="gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    录音中 {recordingTime}s
                  </Badge>
                  <p className="text-xs text-muted-foreground">点击停止录音</p>
                </div>
              </>
            ) : (
              <>
                <Button
                  size="icon"
                  className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/80"
                  onClick={startRecording}
                  disabled={isCoachSpeaking}
                  data-testid="button-start-recording"
                >
                  <Mic className="h-8 w-8" />
                </Button>
                <p className="text-xs text-muted-foreground">
                  {isCoachSpeaking ? "等待教练说完..." : "点击开始回答"}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
