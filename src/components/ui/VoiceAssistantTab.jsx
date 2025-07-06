import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Chip,
  Alert,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Mic,
  MicOff,
  RecordVoiceOver,
  Refresh,
  CheckCircle,
  VolumeUp,
  Send
} from '@mui/icons-material';
import axios from 'axios';

// Theme from Dashboard
const theme = {
  primary: {
    main: '#2563eb',
    light: '#3b82f6',
    dark: '#1d4ed8',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  secondary: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706'
  },
  background: {
    main: '#f8fafc',
    paper: '#ffffff',
    dark: '#1e293b'
  },
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    light: '#94a3b8'
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
};

// Conversation states
const ConversationState = {
  GREETING: "greeting",
  NAME: "name",
  CRIME_TYPE: "crime_type",
  AREA: "area",
  LANDMARK: "landmark",
  CITY: "city",
  DISTRICT: "district",
  ADDRESS_VALIDATION: "address_validation",
  COMPLETE: "complete"
};

const VoiceAssistantTab = () => {
  const [isListening, setIsListening] = useState(true); // Mic on by default
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [currentState, setCurrentState] = useState(ConversationState.GREETING);
  const messagesEndRef = useRef(null);
  const speechSynthesis = window.speechSynthesis;
  
  // User information
  const [userInfo, setUserInfo] = useState({
    name: '',
    crime_type: '',
    area: '',
    landmark: '',
    city: '',
    district: '',
    full_address: '',
    phone_number: '8000123456' // Default phone number for demo
  });

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initialize with greeting
  useEffect(() => {
    resetConversation();
  }, []);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Reset the conversation
  const resetConversation = () => {
    setMessages([]);
    setTranscript('');
    setUserInfo({
      name: '',
      crime_type: '',
      area: '',
      landmark: '',
      city: '',
      district: '',
      full_address: '',
      phone_number: '8000123456'
    });
    setCurrentState(ConversationState.GREETING);
    setSuccess(false);
    setTicketData(null);
    setError('');
    
    // Cancel any ongoing speech
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    // Start with greeting after a short delay
    setTimeout(() => {
      const greeting = "Hello, this is Emergency Crime Reporting Service. I'm here to help you report a crime incident. May I have your full name please?";
      addBotMessage(greeting);
      speakText(greeting);
      setIsListening(true); // Start listening after greeting
    }, 500);
  };

  // Add a bot message to the conversation
  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { sender: 'bot', text }]);
  };

  // Add a user message to the conversation
  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { sender: 'user', text }]);
  };

  // Text-to-speech function
  const speakText = (text) => {
    setIsSpeaking(true);
    
    // Stop any ongoing speech
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Get available voices and select a good one
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onend = () => {
      setIsSpeaking(false);
      // Start listening after speaking is done
      if (currentState !== ConversationState.COMPLETE) {
        setIsListening(true);
      }
    };
    
    speechSynthesis.speak(utterance);
  };

  // Get the next bot response based on current state
  const getResponseForState = () => {
    const responses = {
      [ConversationState.GREETING]: "Hello, this is Emergency Crime Reporting Service. I'm here to help you report a crime incident. May I have your full name please?",
      [ConversationState.NAME]: "Thank you. What type of crime would you like to report?",
      [ConversationState.CRIME_TYPE]: "I understand. Now I need your location details. Which area are you in?",
      [ConversationState.AREA]: "What is the nearest landmark to your location?",
      [ConversationState.LANDMARK]: "Which city are you in?",
      [ConversationState.CITY]: "What is your district?",
      [ConversationState.DISTRICT]: "Is this address correct? Please say yes or no.",
      [ConversationState.ADDRESS_VALIDATION]: "Thank you for providing all the information. Your report has been recorded."
    };
    return responses[currentState] || "I'm sorry, there was an error. Let's continue.";
  };

  // Construct and validate the full address
  const constructAndValidateAddress = () => {
    const fullAddress = `${userInfo.area}, Near ${userInfo.landmark}, ${userInfo.city}, ${userInfo.district} District`;
    setUserInfo(prev => ({ ...prev, full_address: fullAddress }));
    
    const message = `Your complete address is: ${fullAddress}. Is this correct?`;
    addBotMessage(message);
    speakText(message);
    
    setCurrentState(ConversationState.ADDRESS_VALIDATION);
  };

  // Reset address information if user says address is incorrect
  const resetAddressInfo = () => {
    setUserInfo(prev => ({
      ...prev,
      area: '',
      landmark: '',
      city: '',
      district: '',
      full_address: ''
    }));
    
    const message = "Let me collect your address details again. Which area are you in?";
    addBotMessage(message);
    speakText(message);
    
    setCurrentState(ConversationState.AREA);
  };

  // Provide guidance and submit report
  const provideGuidanceAndSubmit = async () => {
    try {
      setLoading(true);
      
      // Submit report to backend
      const response = await axios.post('http://127.0.0.1:8007/create-ticket-from-voice', {
        caller_name: userInfo.name,
        phone_number: userInfo.phone_number,
        crime_type: userInfo.crime_type,
        primary_location: userInfo.area,
        specific_landmark: userInfo.landmark,
        state_region: userInfo.district,
        combined_address: userInfo.full_address,
        summary: `${userInfo.crime_type} reported by ${userInfo.name}`,
        description: `${userInfo.crime_type} incident reported in ${userInfo.area} near ${userInfo.landmark}`,
        additional_context: `Reported via voice assistant on ${new Date().toLocaleString()}`
      });
      
      if (response.data && response.data.ticket_id) {
        setTicketData(response.data);
        setSuccess(true);
        
        // Final message with guidance
        const finalMessage = `Your emergency report has been recorded. Report ID: ${response.data.ticket_id}. Authorities will contact you soon. Stay safe.`;
        addBotMessage(finalMessage);
        speakText(finalMessage);
        
        setCurrentState(ConversationState.COMPLETE);
        setIsListening(false); // Stop listening after completion
      } else {
        throw new Error("Failed to create ticket");
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      setError("There was an error submitting your report. Please try again.");
      
      const errorMessage = "There was an error submitting your report. Please try again.";
      addBotMessage(errorMessage);
      speakText(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Process user input based on current conversation state
  const processUserInput = async (input) => {
    if (!input.trim()) return;
    
    addUserMessage(input);
    setLoading(true);
    setIsListening(false); // Stop listening while processing
    
    try {
      // Process based on current state
      switch(currentState) {
        case ConversationState.GREETING:
          setUserInfo(prev => ({ ...prev, name: input.trim() }));
          setCurrentState(ConversationState.NAME);
          
          const nameResponse = getResponseForState();
          addBotMessage(nameResponse);
          speakText(nameResponse);
          break;
          
        case ConversationState.NAME:
          setUserInfo(prev => ({ ...prev, crime_type: input.trim() }));
          setCurrentState(ConversationState.CRIME_TYPE);
          
          const crimeResponse = getResponseForState();
          addBotMessage(crimeResponse);
          speakText(crimeResponse);
          break;
          
        case ConversationState.CRIME_TYPE:
          setUserInfo(prev => ({ ...prev, area: input.trim() }));
          setCurrentState(ConversationState.AREA);
          
          const areaResponse = getResponseForState();
          addBotMessage(areaResponse);
          speakText(areaResponse);
          break;
          
        case ConversationState.AREA:
          setUserInfo(prev => ({ ...prev, landmark: input.trim() }));
          setCurrentState(ConversationState.LANDMARK);
          
          const landmarkResponse = getResponseForState();
          addBotMessage(landmarkResponse);
          speakText(landmarkResponse);
          break;
          
        case ConversationState.LANDMARK:
          setUserInfo(prev => ({ ...prev, city: input.trim() }));
          setCurrentState(ConversationState.CITY);
          
          const cityResponse = getResponseForState();
          addBotMessage(cityResponse);
          speakText(cityResponse);
          break;
          
        case ConversationState.CITY:
          setUserInfo(prev => ({ ...prev, district: input.trim() }));
          setCurrentState(ConversationState.DISTRICT);
          
          // After getting district, construct and validate address
          setTimeout(() => constructAndValidateAddress(), 500);
          break;
          
        case ConversationState.ADDRESS_VALIDATION:
          if (input.toLowerCase().includes('yes') || input.toLowerCase().includes('correct') || input.toLowerCase().includes('right')) {
            // If address is correct, provide guidance and submit report
            await provideGuidanceAndSubmit();
          } else {
            // If address is incorrect, reset address info
            resetAddressInfo();
          }
          break;
          
        default:
          const defaultResponse = "I'm not sure how to respond to that. Let's continue with the report.";
          addBotMessage(defaultResponse);
          speakText(defaultResponse);
      }
    } catch (err) {
      console.error("Error processing input:", err);
      setError("There was an error processing your input. Please try again.");
      
      const errorMessage = "There was an error processing your input. Please try again.";
      addBotMessage(errorMessage);
      speakText(errorMessage);
    } finally {
      setLoading(false);
      setTranscript('');
    }
  };

  // Handle voice recognition
  useEffect(() => {
    let recognition = null;
    
    const startRecognition = () => {
      try {
        if (!('webkitSpeechRecognition' in window)) {
          setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
          setIsListening(false);
          return;
        }
        
        recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        
        recognition.onstart = () => {
          console.log('Voice recognition started');
          setError(''); // Clear any previous errors
        };
        
        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          
          setTranscript(transcript);
          
          // If this is a final result
          if (event.results[0].isFinal) {
            processUserInput(transcript);
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          
          // Handle different error types
          if (event.error === 'aborted') {
            setError("Speech recognition was aborted. This may be due to browser permissions. Please ensure your microphone is enabled and try again.");
          } else if (event.error === 'not-allowed') {
            setError("Microphone access was denied. Please allow microphone access in your browser settings.");
          } else if (event.error === 'network') {
            setError("Network error occurred. Please check your connection and try again.");
          } else {
            setError(`Speech recognition error: ${event.error}. Please try typing your response instead.`);
          }
          
          setIsListening(false);
        };
        
        recognition.onend = () => {
          console.log('Voice recognition ended');
          // Only restart if we're still in listening mode and not speaking
          if (isListening && !isSpeaking && currentState !== ConversationState.COMPLETE) {
            try {
              recognition.start();
            } catch (e) {
              console.error("Failed to restart recognition:", e);
              setError("Failed to restart voice recognition. Please click the microphone button to try again.");
              setIsListening(false);
            }
          }
        };
        
        recognition.start();
      } catch (e) {
        console.error("Error starting speech recognition:", e);
        setError("Failed to start speech recognition. Please ensure you've granted microphone permissions.");
        setIsListening(false);
      }
    };
    
    if (isListening && !isSpeaking) {
      startRecognition();
    }
    
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          console.error("Error stopping recognition:", e);
        }
      }
    };
  }, [isListening, isSpeaking, currentState]);

  // Toggle listening state
  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Card sx={{ mb: 3, p: 2, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <RecordVoiceOver sx={{ color: theme.primary.main, fontSize: 28 }} />
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Emergency Voice Assistant
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Report emergencies through voice - our AI assistant will guide you
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={resetConversation}
                color="primary"
              >
                Restart
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Status Indicators */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <Chip 
          icon={currentState === ConversationState.COMPLETE ? <CheckCircle /> : 
                isSpeaking ? <VolumeUp /> : 
                isListening ? <Mic /> : <MicOff />}
          label={currentState === ConversationState.COMPLETE ? "Complete" : 
                 isSpeaking ? "Assistant Speaking..." : 
                 isListening ? "Listening..." : "Microphone Off"}
          color={currentState === ConversationState.COMPLETE ? "success" : 
                isSpeaking ? "primary" : 
                isListening ? "error" : "default"}
        />
      </Box>

      {/* Chat Messages */}
      <Paper 
        sx={{ 
          flexGrow: 1, 
          p: 2, 
          mb: 3, 
          maxHeight: '400px',
          overflowY: 'auto',
          borderRadius: 3
        }}
      >
        {messages.map((message, index) => (
          <Box 
            key={index} 
            sx={{ 
              display: 'flex', 
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Paper
              sx={{ 
                p: 2,
                borderRadius: 3,
                bgcolor: message.sender === 'user' ? theme.primary.main : '#f5f5f5',
                color: message.sender === 'user' ? 'white' : 'black',
                maxWidth: '70%'
              }}
            >
              <Typography variant="body1">
                {message.text}
              </Typography>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Paper>

      {/* Success Alert */}
      <Collapse in={success}>
        <Alert 
          severity="success"
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Report Successfully Submitted!
          </Typography>
          {ticketData && (
            <Box>
              <Typography variant="body2">
                <strong>Ticket ID:</strong> {ticketData.ticket_id}
              </Typography>
            </Box>
          )}
        </Alert>
      </Collapse>

      {/* Error Alert */}
      <Collapse in={!!error}>
        <Alert 
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      </Collapse>

      {/* Voice Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color={isListening ? "error" : "primary"}
          startIcon={isListening ? <MicOff /> : <Mic />}
          onClick={toggleListening}
          disabled={currentState === ConversationState.COMPLETE || isSpeaking}
          sx={{ px: 3, py: 1 }}
        >
          {isListening ? "Mute Microphone" : "Enable Microphone"}
        </Button>
        
        {/* Text input for fallback */}
        {error && (
          <Box sx={{ mt: 2, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Paper 
              component="form" 
              sx={{ 
                p: '2px 4px', 
                display: 'flex', 
                alignItems: 'center', 
                width: '100%', 
                maxWidth: 400,
                border: '1px solid #ddd',
                borderRadius: 2
              }}
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.target.elements.textInput.value;
                if (input.trim()) {
                  processUserInput(input);
                  e.target.elements.textInput.value = '';
                }
              }}
            >
              <input
                name="textInput"
                placeholder="Type your response here..."
                style={{ 
                  flex: 1, 
                  border: 'none', 
                  outline: 'none',
                  padding: '8px',
                  fontSize: '16px'
                }}
              />
              <IconButton 
                type="submit" 
                sx={{ p: '10px', color: theme.primary.main }}
                aria-label="send"
              >
                <Send />
              </IconButton>
            </Paper>
          </Box>
        )}
      </Box>
      
      {/* Transcript Display */}
      {transcript && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.05)' }}>
            <Typography variant="body2" color="textSecondary">
              {transcript}
            </Typography>
          </Paper>
        </Box>
      )}
      
      {/* CSS for animations */}
      <style jsx="true">{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </Box>
  );
};

export default VoiceAssistantTab;
