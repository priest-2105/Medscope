import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DrugSearchScreen from '../screens/drugs/DrugSearchScreen';
import DrugDetailScreen from '../screens/drugs/DrugDetailScreen';
import SavedMedicationsScreen from '../screens/drugs/SavedMedicationsScreen';
import SymptomCheckerScreen from '../screens/symptoms/SymptomCheckerScreen';
import SymptomResultScreen from '../screens/symptoms/SymptomResultScreen';
import DiseaseSearchScreen from '../screens/diseases/DiseaseSearchScreen';
import DiseaseDetailScreen from '../screens/diseases/DiseaseDetailScreen';

import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();
const DrugStack = createStackNavigator();
const SymptomStack = createStackNavigator();
const DiseaseStack = createStackNavigator();

function DrugNavigator() {
  return (
    <DrugStack.Navigator screenOptions={{ headerShown: false }}>
      <DrugStack.Screen name="DrugSearch" component={DrugSearchScreen} />
      <DrugStack.Screen name="DrugDetail" component={DrugDetailScreen} />
      <DrugStack.Screen name="SavedMedications" component={SavedMedicationsScreen} />
    </DrugStack.Navigator>
  );
}

function SymptomNavigator() {
  return (
    <SymptomStack.Navigator screenOptions={{ headerShown: false }}>
      <SymptomStack.Screen name="SymptomChecker" component={SymptomCheckerScreen} />
      <SymptomStack.Screen name="SymptomResult" component={SymptomResultScreen} />
    </SymptomStack.Navigator>
  );
}

function DiseaseNavigator() {
  return (
    <DiseaseStack.Navigator screenOptions={{ headerShown: false }}>
      <DiseaseStack.Screen name="DiseaseSearch" component={DiseaseSearchScreen} />
      <DiseaseStack.Screen name="DiseaseDetail" component={DiseaseDetailScreen} />
    </DiseaseStack.Navigator>
  );
}

function TabIcon({ name, focused, color }) {
  return (
    <MaterialCommunityIcons
      name={focused ? name : `${name}-outline`}
      size={24}
      color={color}
    />
  );
}

export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: 60 + insets.bottom,
          paddingBottom: 6 + insets.bottom,
        },
        tabBarActiveTintColor: colors.drug.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tab.Screen
        name="Drugs"
        component={DrugNavigator}
        options={{
          tabBarLabel: 'Drug Info',
          tabBarActiveTintColor: colors.drug.primary,
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? 'pill' : 'pill'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Symptoms"
        component={SymptomNavigator}
        options={{
          tabBarLabel: 'Symptoms',
          tabBarActiveTintColor: colors.symptom.primary,
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? 'stethoscope' : 'stethoscope'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Diseases"
        component={DiseaseNavigator}
        options={{
          tabBarLabel: 'Diseases',
          tabBarActiveTintColor: colors.disease.primary,
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? 'book-open-variant' : 'book-open-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 60,
    paddingBottom: 6,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  tabItem: {
    paddingTop: 2,
  },
});
