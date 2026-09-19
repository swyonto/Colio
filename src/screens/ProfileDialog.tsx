import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassDialog } from '../components/common/GlassDialog';
import { GlassInput } from '../components/common/GlassInput';
import { EmeraldButton } from '../components/common/Buttons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';

interface ProfileDialogProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileDialog: React.FC<ProfileDialogProps> = ({ visible, onClose }) => {
  const { profile, updateProfile } = useCampus();

  const [nickname, setNickname] = useState(profile.appNickname);
  const [name, setName] = useState(profile.name);
  const [roll, setRoll] = useState(profile.rollNumber);
  const [course, setCourse] = useState(profile.course);
  const [branch, setBranch] = useState(profile.branch);
  const [semester, setSemester] = useState(profile.semester);
  const [college, setCollege] = useState(profile.college);

  const handleSave = () => {
    updateProfile({
      appNickname: nickname.trim() || 'CampusHub',
      name: name.trim(),
      rollNumber: roll.trim(),
      course: course.trim(),
      branch: branch.trim(),
      semester: semester.trim(),
      college: college.trim(),
    });
    onClose();
  };

  return (
    <GlassDialog visible={visible} onClose={onClose} title="Student Profile & App Name">
      <Text style={[Typography.bodySm, styles.hintText]}>
        Change your personal app nickname displayed on the top header, and update your academic details.
      </Text>

      {/* SECTION 2.2: App Nickname */}
      <GlassInput
        label="App Display Nickname *"
        placeholder="e.g. CampusHub, MyCollege, AcadLog"
        value={nickname}
        onChangeText={setNickname}
        autoFocus
      />

      <GlassInput
        label="Student Full Name *"
        placeholder="e.g. Aarav Sharma"
        value={name}
        onChangeText={setName}
      />

      <GlassInput
        label="Roll Number / Student ID *"
        placeholder="e.g. 23BCSE042"
        value={roll}
        onChangeText={setRoll}
      />

      <GlassInput
        label="Course / Degree"
        placeholder="e.g. B.Tech Computer Science"
        value={course}
        onChangeText={setCourse}
      />

      <GlassInput
        label="Branch / Specialization"
        placeholder="e.g. CSE - Core"
        value={branch}
        onChangeText={setBranch}
      />

      <GlassInput
        label="Current Semester"
        placeholder="e.g. Semester 5"
        value={semester}
        onChangeText={setSemester}
      />

      <GlassInput
        label="College / University"
        placeholder="e.g. National Institute of Technology"
        value={college}
        onChangeText={setCollege}
      />

      <View style={{ marginTop: 18 }}>
        <EmeraldButton label="Save Profile" onPress={handleSave} />
      </View>
    </GlassDialog>
  );
};

const styles = StyleSheet.create({
  hintText: {
    color: Colors.textMuted,
    marginBottom: 12,
  },
});
