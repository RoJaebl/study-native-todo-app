import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Platform,
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
import { Fontisto, Entypo } from "@expo/vector-icons";
import BouncyCheckbox from "react-native-bouncy-checkbox";

const STORAGE_KEY = "@toDos";
const MODE_KEY = "@mode";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [editText, setEditText] = useState({});
  const [toDos, setToDos] = useState({});
  const refTextInput = useRef(null);
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
      const newToDos = {
        ...toDos,
        [Date.now()]: { text, isChecked: false, working },
      };
      setToDos(newToDos);
      await saveToDos(newToDos);
      setText("");
    }
  };
  const deleteToDo = async (key) => {
    if (Platform.OS == "web") {
      const alert = confirm("Do you want to delete this To Do?");
      if (alert) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
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
    }
  };
  const CheckToDO = async (key) => {
    toDos[key].isChecked = toDos[key].isChecked ? false : true;
    const newToDos = { ...toDos };
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  const editToDo = (payload) =>
    setEditText({ key: editText.key, text: payload });

  const modifyToDO = async (key) => {
    toDos[key].text = editText.text;
    const newToDos = { ...toDos };
    await saveToDos(newToDos);
  };
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
              <View style={styles.toDoSpan}>
                <BouncyCheckbox
                  size={25}
                  fillColor="springgreen"
                  unfillColor={theme.toDoBg}
                  isChecked={toDos[key].isChecked}
                  onPress={() => {
                    CheckToDO(key);
                  }}
                />
                <TextInput
                  onFocus={() => setEditText({ key, text: toDos[key].text })}
                  onBlur={() => {
                    setEditText({ key: null, text: "" });
                    refTextInput.current.setSelection[0] = () => ({
                      start: 0,
                      end: 0,
                    });
                    refTextInput.current.setSelection(0, 0);
                  }}
                  onChangeText={editToDo}
                  onSubmitEditing={() => modifyToDO(key)}
                  returnKeyType="done"
                  style={{
                    ...(toDos[key].isChecked
                      ? styles.textChecked
                      : styles.toDoText),
                    width: "75%",
                  }}
                  editable={toDos[key].isChecked ? false : true}
                  value={key == editText.key ? editText.text : toDos[key].text}
                  ref={refTextInput}
                ></TextInput>
              </View>
              <View style={styles.iconBox}>
                <TouchableOpacity
                  style={{ marginHorizontal: 5 }}
                  onPress={() => deleteToDo(key)}
                >
                  <Fontisto name="trash" size={24} color={theme.grey} />
                </TouchableOpacity>
              </View>
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
  toDoSpan: {
    backgroundColor: theme.toDoBg,
    flexDirection: "row",
    alignItems: "center",
  },
  textChecked: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
    fontStyle: "italic",
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  toDoText: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
    fontStyle: "normal",
    textDecorationLine: "none",
    opacity: 1,
  },
  iconBox: {
    flexDirection: "row",
  },
});
