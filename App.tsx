import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect,useState } from 'react';
import { StyleSheet,Animated, TouchableOpacity, View,Text,Image, ScrollView, TextInput } from 'react-native';
import { useWindowDimensions } from 'react-native';
import axios from "axios";

// ---------- Types ----------
interface ForecastItem {
  wind: any;
  dt: number;
  main: {
    humidity: number; temp: number 
};
  weather: { description: string; icon: string }[];
}

interface ForecastResponse {
  city: {
    timezone: number; name: string 
};
  list: ForecastItem[];
}

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  timezone: number; // in seconds
  daily: ForecastItem[];
}


export default function App() {

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [city, setCity] = useState("dar es salaam");
  const [error, setError] = useState<string | null>(null);
  const phone = useWindowDimensions();
  const [iconsize,setIconSize] = useState<number>(32);
  const [fontsize,setFontSize] = useState<number>(32);
  const [fontsizeMid,setFontSizeMid] = useState<number>(20);
  const [fontsizeSmall,setFontSizeSmall] = useState<number>(16);
  const [fontsizeLarge,setFontSizeLarge] = useState<number>(200);
  const [openSearchPanel] = useState<any>(new Animated.Value(phone.width));
  const [openSettingsPanel] = useState<any>(new Animated.Value(phone.width));
  const [homeBtnColor1,setHomeBtnColor1] = useState<any>('#FB36F4'); 
  const [homeBtnColor2,setHomeBtnColor2] = useState<any>('#0100EC');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null); 
  const [searchBtnColor1,setSearchBtnColor1] = useState<any>('#0000');
  const [searchBtnColor2,setSearchBtnColor2] = useState<any>('#FFFF');
  const [settingsBtnColor1,setSettingsBtnColor1] = useState<any>('#0000');
  const [settingsBtnColor2,setSettingsBtnColor2] = useState<any>('#FFFF');
  const [displayColor1,setDisplayColor1] = useState<any>('#FB36F4'); 
  const [displayColor2,setDisplayColor2] = useState<any>('#b059fdff'); 
  const [displayColor3,setDisplayColor3] = useState<any>('#0100EC'); 
  const [top,setTop] = useState<number>(0.1);
  const [panelWidth,setPanelWidth] = useState<number>(0.205);
  const [descriptionIcon, setDescriptionIcon] = useState<any>(require('./pics/sun.png'));
  const [currentTime, setCurrentTime] = useState<string>('');
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const API_KEY = "b8379a06617b6595ee60f347295ac025";


 const translateDescription = (desc: string, lang: 'en' | 'sw') => {
  if (lang === 'en' || !desc) return desc; // English (default)
  
  const lower = desc.toLowerCase();

  const translations: Record<string, string> = {
    'clear sky': 'anga wazi',
    'few clouds': 'mawingu machache',
    'scattered clouds': 'mawingu yaliyotawanyika',
    'broken clouds': 'mawingu yaliyovunjika',
    'overcast clouds': 'mawingu mengi',
    'light rain': 'mvua nyepesi',
    'moderate rain': 'mvua ya wastani',
    'heavy intensity rain': 'mvua kubwa',
    'thunderstorm': 'radi',
    'snow': 'theluji',
    'drizzle': 'manyunyu',
    'rain': 'mvua',
    'light snow': 'theluji',
  };

  return translations[lower] || desc;
};


const translateWeekday = (weekday: string, lang: 'en' | 'sw') => {
  if (lang === 'en') return weekday; // default English

  const map: Record<string, string> = {
    Sunday: 'Jumapili',
    Monday: 'Jumatatu',
    Tuesday: 'Jumanne',
    Wednesday: 'Jumatano',
    Thursday: 'Alhamisi',
    Friday: 'Ijumaa',
    Saturday: 'Jumamosi',
  };

  return map[weekday] || weekday;
};



 const selecteDay = (index: number) => {
  setSelectedDayIndex(index);

  if (!weatherData) return;
  const dayWeather = weatherData.daily[index];
  const description = dayWeather.weather[0].description.toLowerCase();
  const iconCode = dayWeather.weather[0].icon; // e.g., "01d" or "01n"
  const isNight = iconCode.endsWith("n"); 

  switch (description) {
    case 'scattered clouds':
    case 'broken clouds':
    case 'few clouds':
    case 'overcast clouds':
      setDescriptionIcon(require('./pics/cloud.png'));
      break;
    case 'clear sky':
      setDescriptionIcon(isNight ? require('./pics/moon2.png') : require('./pics/sun.png'));
      break;
    case 'moderate rain':
      setDescriptionIcon(require('./pics/thunder&rain.png'));
      break;  
    case 'rain':
      setDescriptionIcon(require('./pics/rainclouds.png'));
      break;
    case 'light rain':
      setDescriptionIcon(isNight ? require('./pics/nightrain.png') : require('./pics/sunrain.png'));
      break;
    case 'light snow':
      setDescriptionIcon(require('./pics/snow.png'));
      break;  
    case 'thunderstorm':
      setDescriptionIcon(require('./pics/thunder.png'));
      break;
    case 'snow':
      setDescriptionIcon(require('./pics/snow.png'));
      break;
    case 'drizzle':
      setDescriptionIcon(require('./pics/rainclouds.png'));
      break;
    default:
      setDescriptionIcon(require('./pics/sun.png'));
      break;
  }
};



const pressSearchPanel = () => {
    Animated.timing(openSearchPanel, {
    toValue: phone.width*0,
    duration: 500,
    useNativeDriver: true,
  }).start();
   Animated.timing(openSettingsPanel, {
    toValue: phone.width,
    duration: 500,
    useNativeDriver: true,
  }).start();
     setHomeBtnColor1('#0000');
     setHomeBtnColor2('#FFFF');
     setSettingsBtnColor1('#0000');
     setSettingsBtnColor2('#FFFF');
     setSearchBtnColor1('#FB36F4');
     setSearchBtnColor2('#0100EC');
  }

  const pressSettingsPanel = () => {
    Animated.timing(openSettingsPanel, {
    toValue: phone.width*0,
    duration: 500,
    useNativeDriver: true,
  }).start();
    Animated.timing(openSearchPanel, {
    toValue: phone.width,
    duration: 500,
    useNativeDriver: true,
  }).start();
     setHomeBtnColor1('#0000');
     setHomeBtnColor2('#FFFF');
     setSettingsBtnColor1('#FB36F4');
     setSettingsBtnColor2('#0100EC');
     setSearchBtnColor1('#0000');
     setSearchBtnColor2('#FFFF');
  }
  
  const pressHomePanel = () => {
  setSelectedDayIndex(null); // Reset to current day

  // 👇 Reset the icon and description to current weather
  if (weatherData && weatherData.daily.length > 0) {
    const currentWeather = weatherData.daily[0].weather[0];
    const description = currentWeather.description.toLowerCase();
    const iconCode = currentWeather.icon;
    const isNight = iconCode.endsWith("n");

    switch (description) {
      case 'scattered clouds':
      case 'broken clouds':
      case 'few clouds':
      case 'overcast clouds':
        setDescriptionIcon(require('./pics/cloud.png'));
        break;
      case 'clear sky':
        setDescriptionIcon(isNight ? require('./pics/moon2.png') : require('./pics/sun.png'));
        break;
      case 'rain':
        setDescriptionIcon(require('./pics/rainclouds.png'));
        break;
      case 'moderate rain':
        setDescriptionIcon(require('./pics/thunder&rain.png'));
      break;    
      case 'light rain':
         setDescriptionIcon(isNight ? require('./pics/nightrain.png') : require('./pics/sunrain.png'));
        break;
      case 'light snow':
      setDescriptionIcon(require('./pics/snow.png'));
      break;   
      case 'thunderstorm':
        setDescriptionIcon(require('./pics/thunder.png'));
        break;
      case 'snow':
        setDescriptionIcon(require('./pics/snow.png'));
        break;
      case 'drizzle':
        setDescriptionIcon(require('./pics/rainclouds.png'));
        break;
      default:
        setDescriptionIcon(isNight ? require('./pics/moon2.png') : require('./pics/sun.png'));
        break;
    }
  }

  // 🔹 Keep your existing animation and button colors
  Animated.timing(openSearchPanel, { toValue: phone.width, duration: 500, useNativeDriver: true }).start();
  Animated.timing(openSettingsPanel, { toValue: phone.width, duration: 500, useNativeDriver: true }).start();
  setHomeBtnColor1('#FB36F4');
  setHomeBtnColor2('#0100EC');
  setSettingsBtnColor1('#0000');
  setSettingsBtnColor2('#FFFF');
  setSearchBtnColor1('#0000');
  setSearchBtnColor2('#FFFF');
};


  
  const fetchWeather = async ()=> {
       try {
        setError(null);
        setWeatherData(null);

        const res = await axios.get<ForecastResponse>(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
 if (res.data.list.length > 0) {
  const weather = res.data.list[0].weather[0];
  const description = weather.description.toLowerCase();
  const iconCode = weather.icon; // <-- get the icon code from API
  const isNight = iconCode.endsWith("n"); // 'n' means night


  switch (description) {
    case 'scattered clouds':
    case 'broken clouds':
    case 'overcast clouds':
      setDescriptionIcon(require('./pics/cloud.png'));
      break;
    case 'clear sky':
      setDescriptionIcon(isNight ? require('./pics/moon2.png') : require('./pics/sun.png'));
      break;
    case 'moderate rain':
      setDescriptionIcon(require('./pics/thunder&rain.png'));
      break;
    case 'rain':
      setDescriptionIcon(require('./pics/rainclouds.png'));
      break;
    case 'light rain':
       setDescriptionIcon(isNight ? require('./pics/nightrain.png') : require('./pics/sunrain.png'));
      break;
    case 'thunderstorm':
      setDescriptionIcon(require('./pics/thunder.png'));
      break;
    case 'snow':
      setDescriptionIcon(require('./pics/snow.png'));
      break;
    case 'light snow':
      setDescriptionIcon(require('./pics/snow.png'));
      break; 
    case 'drizzle':
      setDescriptionIcon(require('./pics/rainclouds.png'));
      break;
    default:
      setDescriptionIcon(isNight ? require('./pics/moon2.png') : require('./pics/sun.png'));
      break;
  }
}

        // Extract one forecast per day (every 8th entry = 24h)
        const dailyData = res.data.list.filter((_, i) => i % 8 === 0);

    setWeatherData({
  location: res.data.city.name,
  temperature: res.data.list[0].main.temp,
  humidity: res.data.list[0].main.humidity,
  windSpeed: res.data.list[0].wind.speed,
  daily: dailyData.slice(0, 7),
  timezone: res.data.city.timezone, // 👈 add this line
});

Animated.timing(openSearchPanel, { toValue: phone.width, duration: 500, useNativeDriver: true }).start();
 setHomeBtnColor1('#FB36F4');
  setHomeBtnColor2('#0100EC');
  setSettingsBtnColor1('#0000');
  setSettingsBtnColor2('#FFFF');
  setSearchBtnColor1('#0000');
  setSearchBtnColor2('#FFFF');


      } catch (err: any) {
        console.error("Weather fetch error:", err.response?.data || err.message);
        setError("Failed to load weather data. Please check your API key or city name.");
          setDescriptionIcon(require('./pics/3d 404.png'));
      }
    }

    const getLocalTime = (timezoneOffset: number): string => {
  const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
  const local = new Date(utc + timezoneOffset * 1000);

  return local.toLocaleString('en-US', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    day: 'numeric',
    month: 'long',
  });
};

useEffect(() => {
  const interval = setInterval(() => {
    if (weatherData) setCurrentTime(getLocalTime(weatherData.timezone));
  }, 60000); // every minute

  // set initial time immediately too
  if (weatherData) setCurrentTime(getLocalTime(weatherData.timezone));

  return () => clearInterval(interval);
}, [weatherData]);

  

  useEffect(()=>{
     fetchWeather();
    if (phone.height < 680) {
      setIconSize(22);
      setFontSize(22);
      setFontSizeMid(13);
      setFontSizeSmall(7);
      setFontSizeLarge(100);
      setTop(0.13);
      setPanelWidth(0.2);
    }
  },[]);
  
  return (
    <View style={[styles.container,{height:phone.height,width:phone.width}]}>
    {/*Display panel*/}
      <View style={[styles.panel,{height:phone.height,width:phone.width}]} >
         {/*City Display*/}
       <View style={[styles.cityDisplay,{height:phone.height*0.06,width:phone.width*0.5,top:phone.height*0.05,left:phone.width*0.06}]} >
        <Text style={{fontSize:fontsizeMid,color:'white',fontWeight:'700'}} > {weatherData ? weatherData.location : 'Loading...'}</Text>
        </View> 
            {/*City local time Display*/}
          <View style={{height:phone.height*0.06,width:phone.width*0.35,justifyContent:'center',alignItems:'center',position:'absolute',top:phone.height*0.05,left:phone.width*0.6}} >
           <Text style={{ fontSize: fontsizeSmall, color: 'white', fontWeight: '500' }}>
          {currentTime || (weatherData ? getLocalTime(weatherData.timezone) : 'Loading...')}
          </Text>
        </View>

          {/*Main Display panel*/}
        <LinearGradient colors={[displayColor1, displayColor2,displayColor3]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
         style={[styles.displayPanel,{height:phone.height*0.4,
          width:phone.width*0.9,borderRadius:60,top:phone.height*0.12}]} >
            {/*Weather condition Display panel*/}
          <View style={[styles.condition,{height:phone.height*0.03, width:phone.width*0.75,top:phone.height*0.13}]} >
            <Text style={{fontSize: fontsizeMid, color: 'white', fontWeight: '500'}}>
  {weatherData
    ? translateDescription(
        selectedDayIndex === null
          ? weatherData.daily[0].weather[0].description
          : weatherData.daily[selectedDayIndex].weather[0].description,
        language
      )
    : 'Loading...'}
</Text>

</View>
            {/*Temperature panel*/}
             <View style={[styles.temperature,{height:phone.height*0.25, width:phone.width*0.75,top:phone.height*top}]} ><Text style={{fontSize: fontsizeLarge, color: 'white', fontWeight: '700'}}>
  {weatherData
    ? Math.round(
        selectedDayIndex === null
          ? weatherData.temperature
          : weatherData.daily[selectedDayIndex].main.temp
      )
    : '--'}°
</Text>
</View>
             {/*Img weather aicons*/}
          <View style={[styles.icons,{height:phone.height*0.35, width:phone.height*0.35,top:phone.height*0.04}]}  >
            <Image
               source={descriptionIcon}  // local image in your project folder
                style={[styles.image,{height:phone.height*0.35, width:phone.height*0.35}]}
            />
            </View>  
        </LinearGradient>

         {/*Upcomming days label*/}
      <View  style={[styles.daysDisplay,{height:phone.height*0.05,width:phone.width*0.9,top:phone.height*0.655,left:phone.width*0.05,borderRadius:50}]} >

       <View style={{height:phone.height*0.06,width:phone.width*0.30,backgroundColor:'transparent',flexDirection:'row',justifyContent:'center',alignItems:'center'}} >
                <Ionicons name="water-outline" size={iconsize} color="white" />
         <Text style={{ fontSize: fontsizeMid, color: 'white', fontWeight: '500' }}>
        {weatherData ? weatherData.humidity : "loadig..."}%
      </Text>
       </View>

      <View  style={{height:phone.height*0.06,width:phone.width*0.30,backgroundColor:'transparent',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
         <Ionicons name="leaf-outline" size={iconsize} color="white" />
      <Text style={{ fontSize: fontsizeMid, color: 'white', fontWeight: '500' }}>
         {(weatherData ?weatherData.windSpeed * 3.6: 0).toFixed(1)}km/h
      </Text>
      </View>
    
       <View  style={{height:phone.height*0.06,width:phone.width*0.22,backgroundColor:'transparent',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
          <Text style={{fontSize:fontsizeSmall,color:'white',fontWeight:'500'}} >Next 5 Days</Text>
      </View>

      </View>

         {/*Upcomming days panel*/}
  <View style={[styles.upcommingDaysPanel, { height: phone.height * 0.19, width: phone.width * 0.9,top:phone.height*0.295}]}>

    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.upcommingDaysPanel}>
    {weatherData ? (
      weatherData.daily.map((day, index) => {
      const date = new Date(day.dt * 1000);
     const weekdayEnglish = date.toLocaleDateString("en-US", { weekday: "long" });
      const weekday = translateWeekday(weekdayEnglish, language);
       const description = day.weather[0]?.description.toLowerCase();
       const iconCode = day.weather[0]?.icon || "";
       const isNight = iconCode.endsWith("n");
     // ✅ Local icon mapping
   let localIcon = require('./pics/sun.png');
switch (description) {
  case 'scattered clouds':
  case 'broken clouds':
  case 'few clouds':
  case 'overcast clouds':
    localIcon = require('./pics/cloud.png');
    break;
  case 'clear sky':
     localIcon = isNight ? require('./pics/moon2.png') : require('./pics/sun.png');
    break;
  case 'moderate rain':
     localIcon =require('./pics/thunder&rain.png');
    break;  
  case 'rain':
    localIcon = require('./pics/rainclouds.png');
    break;
  case 'light rain':
    localIcon = isNight ? require('./pics/nightrain.png') : require('./pics/sunrain.png');
    break;
  case 'thunderstorm':
    localIcon = require('./pics/thunder.png');
    break;
  case 'snow':
    localIcon = require('./pics/snow.png');
    break;
  case 'light snow':
    localIcon = require('./pics/snow.png');
    break;  
  case 'drizzle':
    localIcon = require('./pics/rainclouds.png');
    break;
  default:
    localIcon = require('./pics/sun.png');
    break;
}

      const isSelected = selectedDayIndex === index;

      return (
       <TouchableOpacity key={index} onPress={() => selecteDay(index)} >
         <LinearGradient  colors={isSelected ? ['#FB36F4', '#0100EC'] : ['#484848', '#484848']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          key={index}
          style={[styles.weeklyWeatherPanel,{ height: phone.height * 0.16, width: phone.width * panelWidth ,borderRadius:50}]}>
          
          <Text style={{ color: "white", fontSize: fontsizeSmall, fontWeight: "600" }}>
           {weekday}
         </Text>

            <Image
             source={localIcon}
              style={{ width: 40, height: 40, marginLeft: 0 }}
            />

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: "white", fontSize: fontsizeSmall }}>
              {Math.round(day.main.temp)}°C
          </Text>
          </View>
        </LinearGradient>
       </TouchableOpacity>
      );
    })
  ) : (
    <Text style={{ color: "white" }}>Loading forecast...</Text>
  )}
</ScrollView>

</View>

         {/*Search panel*/}
       <Animated.View style={[styles.searchPanel,{height:phone.height,width:phone.width, transform: [{ translateX: openSearchPanel }], }]} >

       <View style={{height:phone.height*0.05,width:phone.width*0.9,justifyContent:'center',alignItems:'center',backgroundColor:'black'}} >
        <Text style={{fontSize:fontsizeMid,fontWeight:'700',color:'white'}} >City Finder</Text>
        </View>

        <TextInput value={city} onChangeText={(text)=>setCity(text)} placeholder='Search City ' style={{height:phone.height*0.1,width:phone.width*0.9,
          borderWidth:0,borderRadius:50,backgroundColor:'white',textAlign:'center',color:'black'}} />

        <TouchableOpacity onPress={fetchWeather} >
          <LinearGradient colors={['#FB36F4', '#0100EC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
           style={{height:phone.height*0.1,width:phone.width*0.9,borderRadius:50,justifyContent:'center',alignItems:'center'}} >
              <Text style={{fontSize:fontsizeMid,fontWeight:'700',color:'white'}} >Search City</Text>
          </LinearGradient>
          </TouchableOpacity>  

       </Animated.View> 

          {/*Settings panel*/}
       <Animated.View style={[styles.settingsPanel,{height:phone.height,width:phone.width, transform: [{ translateX: openSettingsPanel }], }]} >
        
       <View style={{height:phone.height*0.05,width:phone.width*0.9,justifyContent:'center',alignItems:'center',backgroundColor:'black',top:phone.height*-0.25}} >
        <Text style={{fontSize:fontsizeMid,fontWeight:'700',color:'white'}} >Settings</Text>
        </View>
         {/*Language buttons & label panel*/}
          <View style={{height:phone.height*0.3,width:phone.width*0.9,justifyContent:'center',backgroundColor:'black',gap:20}} >
         {/*label*/}
         {/*Language buttons*/}
       <View style={{height:phone.height*0.3,width:phone.width*0.9,justifyContent:'center',backgroundColor:'black',gap:20}}>
  {/* Label */}
  <Text style={{fontSize:fontsizeMid,fontWeight:'700',color:'white'}}>Change Language</Text>
  
  {/* Swahili Button */}
  <TouchableOpacity onPress={() => setLanguage('sw')}>
    <LinearGradient colors={[ language === 'en' ? 'white' : '#FB36F4', language === 'en' ? 'white' : '#0100EC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{height:phone.height*0.1,width:phone.width*0.9,borderRadius:50,justifyContent:'center',alignItems:'center'}}>
      <Text style={{fontSize:fontsizeMid,fontWeight:'700',color: language === 'sw' ? '#00ffcc' : 'black'}}>Swahili</Text>
    </LinearGradient>
  </TouchableOpacity>

  {/* English Button */}
  <TouchableOpacity onPress={() => setLanguage('en')}>
    <LinearGradient colors={[ language === 'sw' ? 'white' :'#FB36F4', language === 'sw' ? 'white' : '#0100EC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{height:phone.height*0.1,width:phone.width*0.9,borderRadius:50,justifyContent:'center',alignItems:'center'}}>
      <Text style={{fontSize:fontsizeMid,fontWeight:'700',color: language === 'en' ? '#00ffcc' : 'black'}}>English</Text>
    </LinearGradient>
  </TouchableOpacity>
</View>


        </View>

        </Animated.View> 

       {/*Navigation Panel*/}
       <View style={[styles.navigator,{height:phone.height*0.1,width:phone.width*0.9,
        top:phone.height*0.885,borderRadius:phone.height,gap:phone.width*0.05}]}>
            {/*Home Button*/}
        <TouchableOpacity onPress={pressHomePanel} >
         <LinearGradient colors={[homeBtnColor1, homeBtnColor2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.homeBtn,{height:phone.height*0.07,
          width:phone.height*0.1,}]}><Ionicons name="home" size={iconsize} color="white" /></LinearGradient> 
        </TouchableOpacity>
           {/*Search Button*/}
         <TouchableOpacity  onPress={pressSearchPanel}>
         <LinearGradient colors={[searchBtnColor1, searchBtnColor2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}  style={[styles.homeBtn,{height:phone.height*0.07,
          width:phone.height*0.1,}]}><Ionicons name="search" size={iconsize} color="white" /></LinearGradient > 
        </TouchableOpacity>
           {/*Settings Button*/}
         <TouchableOpacity onPress={pressSettingsPanel} >
         <LinearGradient colors={[settingsBtnColor1, settingsBtnColor2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.homeBtn,{height:phone.height*0.07,
          width:phone.height*0.1,}]}><Ionicons name="settings" size={iconsize} color="white" /></LinearGradient > 
        </TouchableOpacity>
        </View> 
      
      </View>
      <StatusBar style="auto" backgroundColor='white'/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
    panel:{
    display:'flex',
    position:'absolute',
    backgroundColor:'#000',
    justifyContent:'center',
    alignItems:'center',
  },
  cityDisplay:{
    display:'flex',
    position:"absolute",
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'black',
    flexDirection:'row',
  },
  daysDisplay:{
    display:'flex',
    position:"absolute",
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#1b1b1bff',
    flexDirection:'row',
    gap:10
  },
   condition:{
    display:'flex',
    position:"relative",
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'transparent',
  },
  temperature:{
    display:'flex',
    position:"relative",
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'transparent',
  },
  icons:{
    display:'flex',
    position:"relative",
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'transparent',
  },
  image:{
   resizeMode: 'cover',
  },
  upcommingDaysPanel:{
    display:'flex',
    position:"relative",
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'transparent',
    flexDirection:'row',
    gap:10,
  },
  weeklyWeatherPanel:{
    display:'flex',
    position:'relative',
    justifyContent:'center',
    alignItems:'center',
    flexDirection:'column',
  },

  navigator:{
    display:'flex',
    position:'absolute',
    backgroundColor:'#353535ff',
    justifyContent:'center',
    alignItems:'center',
    flexDirection:'row',
  },
  homeBtn:{
    display:'flex',
    position:'relative',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
  },
  searchPanel:{
    display:'flex',
    position:'absolute',
    backgroundColor:'black',
    justifyContent:'center',
    alignItems:'center',
    flexDirection:'column',
    gap:20,
  },
   settingsPanel:{
    display:'flex',
    position:'absolute',
    backgroundColor:'black',
    justifyContent:'center',
    alignItems:'center',
    flexDirection:'column',
  },
  displayPanel:{
    display:'flex',
    position:'absolute',
    justifyContent:'center',
    alignItems:'center',
  },
});

