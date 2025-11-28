
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'What is stamp duty?',
    answer: 'Stamp duty (officially called land transfer duty) is a tax levied by the Victorian government on property purchases. The amount depends on the purchase price and whether you qualify for any concessions or exemptions.',
    category: 'Buying',
  },
  {
    id: '2',
    question: 'Am I eligible for the First Home Buyer exemption?',
    answer: 'You may be eligible if you are purchasing your first home, the property value is under $600,000 (full exemption) or under $750,000 (partial exemption), you are an Australian citizen or permanent resident, and you intend to occupy the property as your principal place of residence for at least 12 months.',
    category: 'Buying',
  },
  {
    id: '3',
    question: 'What are land transfer fees?',
    answer: 'Land transfer fees are charges by Land Use Victoria for registering the transfer of property ownership. The fee varies based on the property value and includes registration of the transfer document.',
    category: 'Buying',
  },
  {
    id: '4',
    question: 'What does a conveyancer do?',
    answer: 'A conveyancer handles the legal aspects of property transfer, including preparing and reviewing contracts, conducting property searches, calculating adjustments, arranging settlement, and ensuring all legal requirements are met.',
    category: 'General',
  },
  {
    id: '5',
    question: 'How much should I budget for legal fees?',
    answer: 'Conveyancing fees typically range from $1,200 to $2,500 depending on the complexity of the transaction. This usually includes professional fees and some disbursements, but additional searches or complex matters may incur extra costs.',
    category: 'General',
  },
  {
    id: '6',
    question: 'What is a Section 32 statement?',
    answer: 'A Section 32 (Vendor Statement) is a legal document that sellers must provide to buyers before signing a contract. It contains important information about the property including title details, zoning, outgoings, and any encumbrances or restrictions.',
    category: 'Selling',
  },
  {
    id: '7',
    question: 'How long does settlement take?',
    answer: 'Settlement typically occurs 30-90 days after the contract is signed, though this can vary. The settlement period is negotiated between buyer and seller and specified in the contract of sale.',
    category: 'General',
  },
  {
    id: '8',
    question: 'What happens at settlement?',
    answer: 'Settlement is when the property officially changes hands. The buyer pays the balance of the purchase price, the seller hands over the keys, and ownership is transferred. Your conveyancer will handle all the paperwork and financial transactions.',
    category: 'General',
  },
  {
    id: '9',
    question: 'Do I need to pay capital gains tax when selling?',
    answer: 'If the property was your principal place of residence for the entire ownership period, you generally won\'t pay capital gains tax. However, if it was an investment property or you didn\'t live there the whole time, CGT may apply. Consult a tax professional for specific advice.',
    category: 'Selling',
  },
  {
    id: '10',
    question: 'What is a cooling-off period?',
    answer: 'In Victoria, buyers have a 3-business-day cooling-off period after signing a contract (except for auction purchases). During this time, you can withdraw from the contract but will forfeit 0.2% of the purchase price.',
    category: 'Buying',
  },
];

export default function FAQScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Buying', 'Selling', 'General'];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Information & FAQ</Text>
          <Text style={styles.subtitle}>
            Find answers to common questions about property transactions in Victoria
          </Text>
        </View>

        <View style={commonStyles.card}>
          <View style={styles.searchContainer}>
            <IconSymbol
              ios_icon_name="magnifyingglass"
              android_material_icon_name="search"
              size={20}
              color={colors.textSecondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search questions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredFAQs.length === 0 ? (
          <View style={commonStyles.card}>
            <Text style={commonStyles.text}>No questions found matching your search.</Text>
          </View>
        ) : (
          filteredFAQs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={commonStyles.card}
              onPress={() => toggleExpand(faq.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <View style={styles.faqQuestion}>
                  <Text style={styles.categoryBadge}>{faq.category}</Text>
                  <Text style={styles.questionText}>{faq.question}</Text>
                </View>
                <IconSymbol
                  ios_icon_name={expandedId === faq.id ? 'chevron.up' : 'chevron.down'}
                  android_material_icon_name={expandedId === faq.id ? 'expand-less' : 'expand-more'}
                  size={24}
                  color={colors.textSecondary}
                />
              </View>
              {expandedId === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.answerText}>{faq.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>Need More Help?</Text>
          <Text style={commonStyles.text}>
            If you can&apos;t find the answer you&apos;re looking for, consider consulting 
            with a qualified conveyancer or solicitor who can provide personalized advice 
            for your specific situation.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 24,
  },
  faqAnswer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  answerText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  bottomPadding: {
    height: 20,
  },
});
