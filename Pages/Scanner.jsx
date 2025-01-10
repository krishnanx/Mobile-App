import React, { useState, useEffect,useRef,useContext } from 'react';
import { Text, View, Button, StyleSheet,Image,TouchableWithoutFeedback,TouchableHighlight, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
// import { CameraView} from "expo-camera";
import { CameraView, Camera } from "expo-camera";
// import { Camera } from 'react-native-camera-kit';
//import * as FileSystem from 'expo-file-system';
import sendBase64ToServer from '../functions/SendPic'
import convertToBase64 from '../functions/Convert';
//import saveBase64ToFile from '../components/Save';
import torch from "../assets/flashlight.png"
import torchW from "../assets/flashlightW.png"
import { bgContext } from '../Context/StateContext';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';
import history from '../functions/history';
import { AuthContext } from '../Context/AuthProvider';

import calcScore from '../functions/calcScore';
const Scanner = () => {
  const [state,setState,Location,setLocation,size,setSize,opacity,setOpacity,routes,setRoutes,info,setInfo] = useContext(bgContext);
  const Navigation = useNavigation();
  const {user} = useContext(AuthContext)
  useEffect(() => {
      if (Navigation) {
          const state = Navigation.getState();
          ////console.log("navigation state:", state.routes[0].name);
          const Index = state.index;
          const location = state.routes[Index].name;
          location==="home"||location==="jane"||location==="Scan"||location==="Saved"||location==="Profile"? (setLocation((prev) => [...prev, location]),setSize(60),setOpacity(1)) : (setLocation((prev) => [...prev, location]),setSize(0),setOpacity(0));
          ////console.log(state.routes[Index].name)
        } else {
          //console.log("Navigation context is undefined");
        }
    }, [Navigation]);
  const [Torch,setTorch] = useState(false);
  const [flash,setFlash] = useState('off')
  const styles = StyleSheet.create({
      Main:{
          flex:1,
          backgroundColor: 'black',
          width:'100%',
          height:750,
          justifyContent:'center',
          alignItems:'center'

      },
      barcode:{
          height:250,
          width:250,
         // borderColor:'white',
          //borderStyle:'solid',
          //borderBottomwidth:'0.5',
      },
      barcodeView:{
        height:255,
        width:255,
        //borderTopWidth:1,
        borderWidth:1.5,
        borderColor:'white',
      },
      requestCamera:{
        //backgroundColor:'#100E1B',
        justifyContent:'center',
        alignItems:'center',
        //borderWidth:1.5,
        textAlign:'center',
        fontSize:20,
        color:'white',
  
      },
      viewPermission:{
        width:'100%',
        height:100,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center'

      },
      ScannedResult:{
        fontSize:20,
        color:'white',
      },
      Scanner:{
        width:'100%',
        height:815,
        justifyContent:'space-around',
        alignItems:'center', 
        position:'relative'     
      },
      torchView: {
        width: 50,
        height: 50,
        backgroundColor:Torch?'yellow':'transparent',
        borderStyle: 'solid',
        borderRadius: 25, // Half of width/height for a perfect circle
        position: 'relative', // Required for child absolute positioning
        flexDirection:'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex:2,
        borderWidth:1.5,
        borderColor:'white',
      },
      Torch: {
        position: 'absolute', // Required for zIndex to work
        zIndex: 20,
        width: 30, // Adjust size as needed
        height: 30, // Adjust size as needed
      },
      PicContainer:{
        height:500,
        width:250,
        flexDirection:'column',
        justifyContent:'space-around'
      },
      torchFeedback:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        width: 60, // Adjust size as needed
        height: 60,
        //backgroundColor:'white',
        zIndex:15,
      },
      TakePic:{
        width:80,
        height:80,
        backgroundColor:'white',
        borderRadius:50
      },
      TakePicView:{
        width:85,
        height:85,
        //backgroundColor:'white',
        borderRadius:50,
        borderWidth:1,
        borderColor:'white',
        justifyContent:'center',
        alignItems:'center'
      },
      activity:{
        position:"absolute",
        zIndex:6,
        top:550,
        
      },
      activityView:{
        height:60,
        width:250,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:"center",
        paddingHorizontal:10
      }
    
    
    })
  const [bgcolor,setBackgroundColor] = useState('black');
  
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  
  const [text,setText] = useState("");
  const [work,setWork] = useState(0);
  
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  },[]);
  useEffect(()=>{
    if (hasPermission === null) {
      setState(-1);
      setBackgroundColor("black");
    }
    if (hasPermission === false) {
      setState(0);
      setBackgroundColor("black");
    }
    if (hasPermission === true) {
      setState(1);
      setBackgroundColor("transparent")
    }
    
    
  },[hasPermission])
  useEffect(()=>{
    //console.log(flash)
  })
  ////console.log('Hello')
  const cameraRef = useRef(null);
  const [photoUri, setPhotoUri] = useState(null);
  const handleTorch = () => {
    Torch?(setTorch(false),setFlash('off')):(setTorch(true),setFlash('on'))
    
  }
  const takePicture = async () => {
    if (cameraRef.current) {
      console.log("pic taken")
      setWork(1)
      //setWork(false)
      try {
        const options = {
          quality: 1,
          base64: true,
          exif: true,
        };
        const photo = await cameraRef.current.takePictureAsync(options);
        setPhotoUri(photo.uri); // Save the photo URI
        //console.log(photo.uri); // Log photo details
        const response = await convertToBase64(photo.uri);
        ////console.log("response",response)
        const result = await sendBase64ToServer(response)
        ////console.log("result",result["data"])
        if(result.status === "success"){
          const response = calcScore(result);
          result["score"] = response 
          setInfo(result)
          await history(user,result)
          Navigation.navigate("Dashboard")
          
        }
        result.status === "success"?(setWork(2),setState(2)):setWork(3);
      } catch (error) {
        console.error("Error taking picture:", error);
      }
    }
  };



  return (
   <View style={styles.Main}>
        <StatusBar style="light" backgroundColor={bgcolor}/>
        {(state===1)?(
          <View
            style={styles.Scanner}
          >
           
            {/*<CameraView
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{barcodeTypes: [
               'qr'
              ]}}
              style={styles.barcode}
            />*/}
             <CameraView 
                  ref={cameraRef} 
                  style={[StyleSheet.absoluteFillObject ]}
                  onCameraReady={() => console.log("Camera ready")} 
                  animateShutter={false} 
                  enableTorch={Torch}
                  autofocus={'on'}
                  //flash={'on'}
                  
                />
            <View
              style={styles.PicContainer}
            >

              <View
                style={styles.torchView}
              >
                <TouchableOpacity
                  style={styles.torchFeedback}
                  onPress={handleTorch}

                >
                  {Torch?(<Image source={torch} style={styles.Torch} />):(<Image source={torchW} style={styles.Torch} />)}
                </TouchableOpacity>
              </View>
              <View
                  style={styles.barcodeView}
              >
              </View>
            </View>
            
            {work===3?<Text
              style={styles.requestCamera}
            >Please scan again....</Text>
            :
            work===2?
            <Text
              style={styles.requestCamera}
            > 
              Scanned
            </Text>
            :work===1?
             
              <View
                style={styles.activityView}
              >
                <Text
                  style={{fontSize:20,color:'white',textAlign:"center",paddingTop:5}}
                >
                  Scanning....
                </Text>
                <ActivityIndicator animating={true} color={MD2Colors.red800} style={{zIndex:6,justifyContent:'center',alignItems:'center',paddingLeft:5}} size={50}/>
              </View>
            :
            <Text>
              {""}
            </Text>
            }
            <View
              style={styles.TakePicView}
            >
              <TouchableOpacity
                onPress={()=>takePicture()}
                style={styles.TakePic}
                activeOpacity={0.5}
              >

              </TouchableOpacity>
            </View>
            {/*<Image source={{ uri:`${photoUri}` }} style={{ width: 200, height: 200 }} />*/}
            
          </View>

         
        ):(state===0)?(
          <View
            style={styles.viewPermission}
          >
            <Text
            style={styles.requestCamera}
            > Camera Permission Denied! </Text>
            <Text
              style={styles.requestCamera}
            >Try Again</Text>
          </View>

        ):(state===-1)?(
          <View
            style={styles.viewPermission}
          >
            <Text
              style={styles.requestCamera}
            > Waiting For Permisions..... </Text>
          </View>
          
        ):(<></>)}
        
   </View>
  )
}

export default Scanner