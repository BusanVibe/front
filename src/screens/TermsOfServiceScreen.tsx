/**
 * 서비스 이용약관 화면
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const TermsOfServiceScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>서비스 이용약관</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>부산스럽다 서비스 이용약관</Text>
          <Text style={styles.date}>시행일: 2025년 8월 19일</Text>

          <Text style={styles.sectionTitle}>제1조 (목적)</Text>
          <Text style={styles.text}>
            이 약관은 부산스럽다(이하 "회사")가 제공하는 부산 여행 혼잡도 가이드
            서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자간의 권리, 의무
            및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </Text>

          <Text style={styles.sectionTitle}>제2조 (정의)</Text>
          <Text style={styles.text}>
            1. "서비스"란 회사가 제공하는 부산 지역 관광지, 맛집, 문화시설 등의
            혼잡도 정보 및 여행 가이드 서비스를 말합니다.{'\n'}
            2. "이용자"란 회사의 약관에 따라 서비스를 이용하는 회원 및 비회원을
            말합니다.{'\n'}
            3. "회원"란 회사와 서비스 이용계약을 체결하고 이용자 아이디(ID)를
            부여받은 자를 말합니다.
          </Text>

          <Text style={styles.sectionTitle}>제3조 (약관의 게시와 개정)</Text>
          <Text style={styles.text}>
            1. 회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스
            초기화면에 게시합니다.{'\n'}
            2. 회사는 약관의 규제에 관한 법률, 정보통신망 이용촉진 및 정보보호
            등에 관한 법률 등 관련법을 위배하지 않는 범위에서 이 약관을 개정할
            수 있습니다.
          </Text>

          <Text style={styles.sectionTitle}>제4조 (서비스의 제공 및 변경)</Text>
          <Text style={styles.text}>
            1. 회사는 다음과 같은 업무를 수행합니다:{'\n'}- 부산 지역 관광지
            혼잡도 정보 제공{'\n'}- 맛집 및 문화시설 정보 제공{'\n'}- 축제 및
            이벤트 정보 제공{'\n'}- 기타 부산 여행 관련 정보 제공{'\n'}
            2. 회사는 서비스의 내용을 변경할 수 있으며, 변경된 서비스의 내용 및
            제공일자를 제공하기 전에 공지합니다.
          </Text>

          <Text style={styles.sectionTitle}>제5조 (서비스 이용)</Text>
          <Text style={styles.text}>
            1. 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.{'\n'}
            2. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의
            두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할
            수 있습니다.
          </Text>

          <Text style={styles.sectionTitle}>제6조 (회원가입)</Text>
          <Text style={styles.text}>
            1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이
            약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.{'\n'}
            2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각
            호에 해당하지 않는 한 회원으로 등록합니다:{'\n'}- 가입신청자가 이
            약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우{'\n'}- 등록
            내용에 허위, 기재누락, 오기가 있는 경우
          </Text>

          <Text style={styles.sectionTitle}>제7조 (개인정보보호)</Text>
          <Text style={styles.text}>
            회사는 관련법이 정하는 바에 따라서 이용자 등록정보를 포함한 이용자의
            개인정보를 보호하기 위하여 노력합니다. 이용자의 개인정보보호에
            관해서는 관련법 및 회사의 개인정보처리방침이 적용됩니다.
          </Text>

          <Text style={styles.sectionTitle}>제8조 (이용자의 의무)</Text>
          <Text style={styles.text}>
            1. 이용자는 다음 행위를 하여서는 안됩니다:{'\n'}- 신청 또는 변경시
            허위내용의 등록{'\n'}- 타인의 정보도용{'\n'}- 회사가 게시한 정보의
            변경{'\n'}- 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의
            송신 또는 게시{'\n'}- 회사 기타 제3자의 저작권 등 지적재산권에 대한
            침해{'\n'}- 기타 불법적이거나 부당한 행위
          </Text>

          <Text style={styles.sectionTitle}>제9조 (서비스 이용제한)</Text>
          <Text style={styles.text}>
            회사는 이용자가 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을
            방해한 경우, 경고, 일시정지, 영구이용정지 등으로 서비스 이용을
            단계적으로 제한할 수 있습니다.
          </Text>

          <Text style={styles.sectionTitle}>제10조 (손해배상)</Text>
          <Text style={styles.text}>
            1. 회사는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가
            발생하더라도 동 손해가 회사의 고의 또는 중대한 과실에 의한 경우를
            제외하고는 이에 대하여 책임을 부담하지 아니합니다.{'\n'}
            2. 회사가 제공하는 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에
            관하여는 회사가 고의 또는 중대한 과실이 없는 한 회사는 어떠한 책임도
            부담하지 아니합니다.
          </Text>

          <Text style={styles.sectionTitle}>제11조 (면책조항)</Text>
          <Text style={styles.text}>
            1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를
            제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.{'\n'}
            2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는
            책임을 지지 않습니다.{'\n'}
            3. 회사는 이용자가 서비스를 이용하여 기대하는 수익을 얻지 못하거나
            상실한 것에 대하여는 책임을 지지 않습니다.
          </Text>

          <Text style={styles.sectionTitle}>제12조 (준거법 및 관할법원)</Text>
          <Text style={styles.text}>
            1. 회사와 이용자 간에 발생한 분쟁에 관한 소송은 대한민국의 법을
            적용하며, 회사의 본사 소재지를 관할하는 법원을 관할 법원으로 합니다.
            {'\n'}
            2. 이 약관에 명시되지 않은 사항은 관계법령 및 상관례에 따릅니다.
          </Text>

          <Text style={styles.footer}>
            부칙{'\n'}이 약관은 2025년 8월 19일부터 적용됩니다.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 25,
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
    marginBottom: 15,
  },
  footer: {
    fontSize: 14,
    color: '#666',
    marginTop: 30,
    marginBottom: 40,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TermsOfServiceScreen;
