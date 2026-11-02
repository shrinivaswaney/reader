import { Tabs } from 'expo-router';
import { HouseIcon } from 'phosphor-react-native';

function TabsNavigator() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <HouseIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

export default function TabsLayout() {
  return <TabsNavigator/>
}
