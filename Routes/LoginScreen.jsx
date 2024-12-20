// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { TextInput , Button, IconButton } from 'react-native-paper';


export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [helperText , setHelperText] = useState({value:"" , color:""});
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleChangePassword = (text)=>{
    setPassword(text);
}

  const handleLogin = () => {
    if(email.length === 0 || password.length === 0){
      setHelperText({value:"Please fill all fields" , color:"red"});
    }
    else if(password.length<6){
        setHelperText({value:"Password must be atleast 6 characters" , color:"red"});
    }
    else if(emailRegex.test(email) === false){
        setHelperText({value:"Invalid email" , color:"red"});
    }
    else{
        setHelperText({value:"Logged In" , color:"green"});
        console.log("Email: " , email , "Password: " , password);
        navigation.navigate("Home");
  }

    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <View style={styles.card}>
        <View id='top container' style={{width:"100%" ,  marginLeft:30 }}>
          <IconButton 
            icon="arrow-left"
            iconColor={"#007bff"}
            size={30}
            mode='contained'
            onPress={() => navigation.navigate("Welcome")}
            />
        </View>

        <View style={styles.inputContainer}>
        <TextInput style={styles.input}
          label={"Email"}
          value={email}
          mode="outlined"
          left={<TextInput.Icon name="email" icon={"email"}/>}
          onChangeText={setEmail}
          theme={{
            colors: {
              primary: '#007bff', // Change the focused outline color
            },
          }}
        />
        <TextInput
          style={styles.input}
          label="Password"
          value={password}  
          onChangeText={handleChangePassword}
          mode='outlined'
          secureTextEntry = {!passwordVisible}
          left = {<TextInput.Icon icon="lock" />}
          right= {<TextInput.Icon 
            icon={passwordVisible ? "eye-off" : "eye"} // Icon changes dynamically
            onPress={() => setPasswordVisible(!passwordVisible)} // Toggle visibility
          />}
          theme={{
            colors: {
              primary: '#007bff', // Change the focused outline color
            },
          }}
        />
        </View>
        <Text style={{marginTop:-20 , color:helperText.color }}>
          {helperText.value}
        </Text>

        <View style={{width:"100%" , alignItems:"center"}}> 
          <Button icon="login" textColor='#fff' mode="elevated" style={styles.button} onPress={handleLogin}>
          Login
          </Button>
          <Button textColor='black'>Forgot passsword?</Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    width: '90%',
    height: 400,
    gap:30,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    display: 'flex',
    alignItems:"center",
    justifyContent:"center"
  },
  inputContainer:{
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    width: '90%',
    borderColor:"#007bff",
    marginBottom: 5,
  },
  button:{
    width: '90%',
    backgroundColor: '#007bff',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupLink:{
    marginTop:5,
  },
  button2:{
    width: '80%',
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
    position:"absolute",
    bottom:50
  },
  iconButton:{
    height:40,
    width:50,
    borderRadius:8,
    backgroundColor:"#007bff",
    alignItems:"center",
    justifyContent:"center",
    marginBottom:20
  }
});
