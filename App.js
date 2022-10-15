import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { theme } from "./color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto } from "@expo/vector-icons";

const STORAGE_KEY = "@toDos";
const MODE_KEY = "@mode";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  useEffect(() => {
    loadToDos();
    loadMode();
  }, []);
  const setMode = async (mode) => {
    setWorking(mode);
    await saveMode(mode);
  };
  const saveMode = async (mode) => {
    await AsyncStorage.setItem(MODE_KEY, JSON.stringify({ mode }));
  };
  const loadMode = async () => {
    const load = await AsyncStorage.getItem(MODE_KEY);
    if (load) {
      setWorking(JSON.parse(load).mode);
    }
  };
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) =>
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  const loadToDos = async () => {
    const load = await AsyncStorage.getItem(STORAGE_KEY);
    if (load) {
      setToDos(JSON.parse(load));
    }
  };
  const addToDo = async () => {
    if (text == "") return;
    else {
      const newToDos = { ...toDos, [Date.now()]: { text, working } };
      setToDos(newToDos);
      await saveToDos(newToDos);
      setText("");
    }
  };
  const deleteToDo = async (key) => {
    Alert.alert("Delete To Do?", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };

  /**
   * @TODO
   * [] 현재있는 모드 기억하여 앱을 재시작하여 기역한 모드로 이동
   * [] checkBox를 만들어서 todo를 완료했는지 확인하는 기능 추가
   * [] todo를 수정할 수 있는 기능 추가
   */
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMode(true)}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode(false)}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        style={styles.input}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
      ></TextInput>
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working == working ? (
            <View style={styles.toDo} key={key}>
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Fontisto name="trash" size={18} color={theme.grey} />
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toDoText: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
});
