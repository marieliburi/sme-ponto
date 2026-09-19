import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const TABS = [
  { id: 'home', label: 'Ponto', icon: '⏱' },
  { id: 'timesheet', label: 'Espelho', icon: '📅' },
  { id: 'justification', label: 'Justificativa', icon: '📝' },
  { id: 'profile', label: 'Perfil', icon: '👤' }
];

export default function BottomNav({ activeTab, onSelectTab }) {
  return (
    <View style={styles.navBar}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => onSelectTab(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: 'rgba(248, 249, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 4
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    height: '100%'
  },
  tabIcon: {
    fontSize: 20,
    color: colors.onSurfaceVariant,
    marginBottom: 2
  },
  tabIconActive: {
    color: colors.onSurface,
    transform: [{ scale: 1.1 }]
  },
  tabLabel: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontWeight: '500'
  },
  tabLabelActive: {
    color: colors.onSurface,
    fontWeight: '700'
  }
});
