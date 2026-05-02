import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, PanResponder, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import ArtworkService from '../services/artwork.service';
import config from '../config';

const { width, height } = Dimensions.get('window');
const API_BASE = config.BASE_URL;

const TEMPLATE_1 = require('../../assets/living_room_1.jpeg');
const TEMPLATE_2 = require('../../assets/living_room_2.png');
const DEMO_VIDEO = require('../../assets/demo_video.mp4');

export default function InteriorVisualizerScreen({ route }) {
  const { id } = route.params;
  const [artwork, setArtwork] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [position, setPosition] = useState({ x: width / 2 - 75, y: height / 3 });
  const [artSize, setArtSize] = useState(150);
  const [showDemo, setShowDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  // Use refs to track the current position without triggering re-renders during pan
  const posRef = useRef({ x: width / 2 - 75, y: height / 3 });

  useEffect(() => { 
    (async () => { 
      try { 
        const r = await ArtworkService.getArtworkById(id); 
        setArtwork(r.data); 
      } catch (e) {} 
      setLoading(false);
    })(); 
  }, [id]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        setPosition({ x: posRef.current.x + g.dx, y: posRef.current.y + g.dy });
      },
      onPanResponderRelease: (_, g) => {
        posRef.current = { x: posRef.current.x + g.dx, y: posRef.current.y + g.dy };
      },
    })
  ).current;

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setBgImage({ uri: result.assets[0].uri });
    }
  };

  const resetCanvas = () => {
    setBgImage(null);
    posRef.current = { x: width / 2 - 75, y: height / 3 };
    setPosition(posRef.current);
    setArtSize(150);
  };

  if (loading || !artwork) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  const imageUri = artwork.imageUrl?.startsWith('http') ? artwork.imageUrl : `${API_BASE}${artwork.imageUrl}`;

  return (
    <View style={s.container}>
      {/* Header Area */}
      <LinearGradient colors={[colors.dark, colors.surface]} style={s.header}>
        <Text style={s.headerTitle}>Wall <Text style={{color: colors.primary}}>Visualizer</Text></Text>
        <Text style={s.headerSub}>Visualize "{artwork.title}" in your own space.</Text>
        <TouchableOpacity style={s.demoBtn} onPress={() => setShowDemo(true)}>
           <Ionicons name="play-circle" size={18} color="#fff" />
           <Text style={s.demoBtnText}>See Demo</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Main Area */}
      <View style={s.mainArea}>
        {!bgImage ? (
          <View style={s.placeholderArea}>
            <View style={s.glassCard}>
              <Ionicons name="image-outline" size={48} color={colors.textSecondary} style={{marginBottom: 10}} />
              <Text style={s.stepText}>Step 1: Choose a background</Text>
              
              <View style={s.btnRow}>
                 <TouchableOpacity style={s.btnTemplate} onPress={() => setBgImage(TEMPLATE_1)}>
                    <Text style={s.btnTemplateText}>Template 1</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={s.btnTemplate} onPress={() => setBgImage(TEMPLATE_2)}>
                    <Text style={s.btnTemplateText}>Template 2</Text>
                 </TouchableOpacity>
              </View>
              
              <Text style={s.orText}>or</Text>
              
              <TouchableOpacity style={s.btnUpload} onPress={pickImage}>
                 <Ionicons name="cloud-upload" size={18} color="#fff" />
                 <Text style={s.btnUploadText}>Upload Custom Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={s.room}>
            <Image source={bgImage} style={s.bgImageFull} resizeMode="cover" />
            <View style={[s.artworkWrap, { left: position.x, top: position.y, width: artSize, height: artSize }]} {...panResponder.panHandlers}>
              <Image source={{ uri: imageUri }} style={s.artImage} resizeMode="contain" />
              <View style={s.frame} />
            </View>
          </View>
        )}
      </View>

      {/* Controls Area (only show if bg is selected) */}
      {bgImage && (
        <View style={s.controls}>
          <Text style={s.hint}>Drag & resize to match scale</Text>
          <View style={s.sizeRow}>
            <Text style={s.sizeLabel}>Size:</Text>
            {[100, 150, 200, 250].map(sz => (
              <TouchableOpacity key={sz} style={[s.sizeBtn, artSize === sz && s.sizeBtnActive]} onPress={() => setArtSize(sz)}>
                <Text style={[s.sizeBtnText, artSize === sz && { color: '#fff' }]}>{sz === 100 ? 'S' : sz === 150 ? 'M' : sz === 200 ? 'L' : 'XL'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.actionRow}>
            <TouchableOpacity style={s.resetBtn} onPress={resetCanvas}>
               <Ionicons name="refresh" size={16} color="#fff" />
               <Text style={s.resetBtnText}>Reset Canvas</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Demo Video Modal */}
      <Modal visible={showDemo} transparent={true} animationType="fade">
        <View style={s.modalBg}>
          <View style={s.modalContent}>
            <TouchableOpacity style={s.closeBtn} onPress={() => setShowDemo(false)}>
               <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Video
              source={DEMO_VIDEO}
              style={s.video}
              useNativeControls
              resizeMode="contain"
              isLooping
              shouldPlay
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dark },
  header: { padding: 20, alignItems: 'center', paddingBottom: 30 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: 16 },
  demoBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6, borderWidth: 1, borderColor: colors.border },
  demoBtnText: { fontWeight: '700', color: '#fff', fontSize: 13 },
  mainArea: { flex: 1, backgroundColor: '#000' },
  placeholderArea: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  glassCard: { width: '100%', backgroundColor: colors.surface, borderRadius: 24, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  stepText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 20 },
  btnRow: { flexDirection: 'row', gap: 10 },
  btnTemplate: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, flex: 1, alignItems: 'center' },
  btnTemplateText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  orText: { color: colors.textMuted, marginVertical: 15, fontSize: 14 },
  btnUpload: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border, gap: 8, width: '100%', justifyContent: 'center' },
  btnUploadText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  room: { flex: 1, overflow: 'hidden', position: 'relative' },
  bgImageFull: { width: '100%', height: '100%' },
  artworkWrap: { position: 'absolute', zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 10 },
  artImage: { width: '100%', height: '100%', borderRadius: 2 },
  frame: { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderWidth: 4, borderColor: '#3E2723', borderRadius: 2 },
  controls: { backgroundColor: colors.surface, padding: 16, paddingBottom: 30, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: colors.border },
  hint: { color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginBottom: 12, fontWeight: '600' },
  sizeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 },
  sizeLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  sizeBtn: { backgroundColor: colors.dark, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  sizeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sizeBtnText: { color: colors.textSecondary, fontWeight: '700' },
  actionRow: { flexDirection: 'row', justifyContent: 'center' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.dark, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  resetBtnText: { color: '#fff', fontWeight: '700' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '100%', height: 300, position: 'relative' },
  closeBtn: { position: 'absolute', top: -40, right: 20, zIndex: 100, padding: 10 },
  video: { width: '100%', height: '100%' }
});
