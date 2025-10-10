import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface VoiceQuizProps {
  onComplete: (results: any) => void;
  onSkip?: () => void;
}

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "描述一下你理想的周末活动",
    hint: "例如：和朋友聚会、独自阅读、户外探险等",
    duration: 30
  },
  {
    id: 2,
    question: "当遇到新朋友时，你通常如何开始对话？",
    hint: "描述你的社交风格和习惯",
    duration: 30
  },
  {
    id: 3,
    question: "你更喜欢计划好的活动，还是随性而为？为什么？",
    hint: "分享你的决策方式和偏好",
    duration: 30
  },
  {
    id: 4,
    question: "当朋友需要建议时，你通常会怎么做？",
    hint: "描述你的倾听和支持方式",
    duration: 30
  },
  {
    id: 5,
    question: "什么样的活动或话题最能激发你的热情？",
    hint: "分享你的兴趣和激情所在",
    duration: 30
  }
];

export default function VoiceQuiz({ onComplete, onSkip }: VoiceQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
      // In a real implementation, this would send to backend for OpenAI Whisper transcription
      // For demo, we'll simulate with a delay and mock response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResponse = `关于问题 ${currentQuestion + 1} 的回答 - 这是模拟的语音转文字结果。`;
      const newResponses = [...responses, mockResponse];
      setResponses(newResponses);

      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Quiz complete - analyze responses
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
      // In real implementation, send to backend for OpenAI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock personality analysis results
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

      <Card className="border shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="font-display font-bold text-lg">{question.question}</h3>
            <p className="text-xs text-muted-foreground">{question.hint}</p>
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
                  data-testid="button-start-recording"
                >
                  <Mic className="h-8 w-8" />
                </Button>
                <p className="text-xs text-muted-foreground">点击开始回答</p>
              </>
            )}
          </div>

          <div className="pt-2 text-center">
            <p className="text-xs text-muted-foreground">
              建议录音时长：{question.duration}秒以内
            </p>
          </div>
        </CardContent>
      </Card>

      {onSkip && currentQuestion === 0 && (
        <Button 
          variant="ghost" 
          className="w-full" 
          onClick={onSkip}
          data-testid="button-skip-quiz"
        >
          跳过，稍后完成
        </Button>
      )}
    </div>
  );
}
