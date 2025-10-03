import { Tabs } from "expo-router";
import { ArrowLeftRight, History, Settings, HelpCircle, MessageCircle } from "lucide-react-native";
import React from "react";

function RootLayoutNav() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4F46E5",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="exchange"
        options={{
          title: "Exchange",
          tabBarIcon: ({ color }) => <ArrowLeftRight size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => <History size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: "Help",
          tabBarIcon: ({ color }) => <HelpCircle size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: "Support",
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return <RootLayoutNav />;
}