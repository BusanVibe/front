/**
 * 개인정보 처리방침 화면
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

const PrivacyPolicyScreen: React.FC = () => {
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
          <Text style={styles.headerTitle}>개인정보 처리방침</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>부산스럽다 개인정보 처리방침</Text>
          <Text style={styles.date}>시행일: 2025년 8월 19일</Text>

          <Text style={styles.intro}>
            부산스럽다(이하 "회사")는 개인정보보호법 제30조에 따라 정보주체의
            개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수
            있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </Text>

          <Text style={styles.sectionTitle}>제1조 (개인정보의 처리목적)</Text>
          <Text style={styles.text}>
            회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는
            개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이
            변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등
            필요한 조치를 이행할 예정입니다.{'\n\n'}
            1. 회원 가입 및 관리{'\n'}- 회원 가입의사 확인, 회원제 서비스 제공에
            따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종
            고지·통지, 고충처리 목적으로 개인정보를 처리합니다.{'\n\n'}
            2. 서비스 제공{'\n'}- 부산 여행 정보 제공, 혼잡도 정보 제공, 맞춤형
            콘텐츠 제공, 서비스 이용기록과 접속빈도 분석, 서비스 이용의 유효성
            확인, 서비스 개선을 위한 기초 자료 제공을 목적으로 개인정보를
            처리합니다.{'\n\n'}
            3. 마케팅 및 광고에의 활용{'\n'}- 신규 서비스(제품) 개발 및 맞춤
            서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공,
            인구통계학적 특성에 따른 서비스 제공 및 광고 게재, 서비스의 유효성
            확인, 접속빈도 파악 또는 회원의 서비스 이용에 대한 통계를 목적으로
            개인정보를 처리합니다.
          </Text>

          <Text style={styles.sectionTitle}>
            제2조 (개인정보의 처리 및 보유기간)
          </Text>
          <Text style={styles.text}>
            1. 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
            개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서
            개인정보를 처리·보유합니다.{'\n\n'}
            2. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:{'\n'}- 회원
            가입 및 관리: 서비스 이용계약 또는 회원가입 해지시까지{'\n'}- 서비스
            제공: 서비스 이용계약 또는 회원가입 해지시까지{'\n'}- 마케팅 및 광고
            활용: 동의철회시까지{'\n'}- 법령에 의한 보존: 관련 법령에서 정한
            기간
          </Text>

          <Text style={styles.sectionTitle}>
            제3조 (처리하는 개인정보의 항목)
          </Text>
          <Text style={styles.text}>
            회사는 다음의 개인정보 항목을 처리하고 있습니다:{'\n\n'}
            1. 필수항목{'\n'}- 이메일, 비밀번호, 닉네임{'\n\n'}
            2. 선택항목{'\n'}- 휴대전화번호, 관심 지역, 여행 선호도{'\n\n'}
            3. 자동 수집항목{'\n'}- IP주소, 쿠키, MAC주소, 서비스 이용기록,
            방문기록, 불량 이용기록 등
          </Text>

          <Text style={styles.sectionTitle}>제4조 (개인정보의 제3자 제공)</Text>
          <Text style={styles.text}>
            1. 회사는 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서
            명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정
            등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를
            제3자에게 제공합니다.{'\n\n'}
            2. 회사는 현재 개인정보를 제3자에게 제공하고 있지 않습니다.
          </Text>

          <Text style={styles.sectionTitle}>제5조 (개인정보처리의 위탁)</Text>
          <Text style={styles.text}>
            1. 회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보
            처리업무를 위탁하고 있습니다:{'\n\n'}- 서버 호스팅: AWS, 클라우드
            서비스 제공{'\n'}- 데이터 분석: Google Analytics, 서비스 이용 통계
            분석{'\n\n'}
            2. 회사는 위탁계약 체결시 개인정보보호법 제26조에 따라 위탁업무
            수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한,
            수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등
            문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고
            있습니다.
          </Text>

          <Text style={styles.sectionTitle}>
            제6조 (정보주체의 권리·의무 및 행사방법)
          </Text>
          <Text style={styles.text}>
            1. 정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련
            권리를 행사할 수 있습니다:{'\n'}- 개인정보 처리현황 통지요구{'\n'}-
            개인정보 열람요구{'\n'}- 개인정보 정정·삭제요구{'\n'}- 개인정보
            처리정지요구{'\n\n'}
            2. 제1항에 따른 권리 행사는 회사에 대해 서면, 전화, 전자우편,
            모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체없이
            조치하겠습니다.{'\n\n'}
            3. 정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한
            경우에는 회사는 정정 또는 삭제를 완료할 때까지 당해 개인정보를
            이용하거나 제공하지 않습니다.
          </Text>

          <Text style={styles.sectionTitle}>제7조 (개인정보의 파기)</Text>
          <Text style={styles.text}>
            1. 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
            불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
            {'\n\n'}
            2. 정보주체로부터 동의받은 개인정보 보유기간이 경과하거나 처리목적이
            달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야
            하는 경우에는, 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나
            보관장소를 달리하여 보존합니다.{'\n\n'}
            3. 개인정보 파기의 절차 및 방법은 다음과 같습니다:{'\n'}- 파기절차:
            회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보
            보호책임자의 승인을 받아 개인정보를 파기합니다.{'\n'}- 파기방법:
            전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을
            사용합니다.
          </Text>

          <Text style={styles.sectionTitle}>
            제8조 (개인정보의 안전성 확보조치)
          </Text>
          <Text style={styles.text}>
            회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고
            있습니다:{'\n\n'}
            1. 관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등{'\n'}
            2. 기술적 조치: 개인정보처리시스템 등의 접근권한 관리,
            접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치
            {'\n'}
            3. 물리적 조치: 전산실, 자료보관실 등의 접근통제
          </Text>

          <Text style={styles.sectionTitle}>제9조 (개인정보보호책임자)</Text>
          <Text style={styles.text}>
            1. 회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보
            처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와
            같이 개인정보보호책임자를 지정하고 있습니다:{'\n\n'}
            개인정보보호책임자{'\n'}- 성명: 개인정보보호책임자{'\n'}- 직책:
            개발팀장{'\n'}- 연락처: psh2968@naver.com{'\n\n'}
            2. 정보주체께서는 회사의 서비스를 이용하시면서 발생한 모든 개인정보
            보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을
            개인정보보호책임자에게 문의하실 수 있습니다.
          </Text>

          <Text style={styles.sectionTitle}>
            제10조 (개인정보 처리방침 변경)
          </Text>
          <Text style={styles.text}>
            1. 이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른
            변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일
            전부터 공지사항을 통하여 고지할 것입니다.{'\n\n'}
            2. 회사는 개인정보처리방침을 개정하는 경우 개정된 개인정보처리방침의
            적용일자 및 개정사유를 명시하여 현행 개인정보처리방침과 함께
            적용일자 7일 이전부터 공지합니다.
          </Text>

          <Text style={styles.footer}>
            부칙{'\n'}이 개인정보처리방침은 2025년 8월 19일부터 적용됩니다.
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
    marginBottom: 20,
    textAlign: 'center',
  },
  intro: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
    marginBottom: 25,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
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

export default PrivacyPolicyScreen;
