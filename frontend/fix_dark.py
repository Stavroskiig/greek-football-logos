import sys

with open('src/app/components/quiz-menu/quiz-menu.component.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('class="text-4xl font-bold text-gray-900 mb-2"', 'class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2"')
text = text.replace('class="text-xl text-gray-600"', 'class="text-xl text-gray-600 dark:text-gray-400"')

text = text.replace('class="bg-white rounded-2xl shadow-lg', 'class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg')
text = text.replace('class="text-xl font-bold text-gray-900 mb-2"', 'class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2"')
text = text.replace('class="text-gray-600 mb-4"', 'class="text-gray-600 dark:text-gray-400 mb-4"')
text = text.replace('class="text-2xl font-bold text-gray-900"', 'class="text-2xl font-bold text-gray-900 dark:text-gray-100"')
text = text.replace('class="text-gray-400 hover:text-gray-600 transition-colors"', 'class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"')
text = text.replace('class="block text-sm font-medium text-gray-700 mb-2"', 'class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"')
text = text.replace('class="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"', 'class="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"')
text = text.replace('class="text-sm text-gray-500 mt-1"', 'class="text-sm text-gray-500 dark:text-gray-400 mt-1"')
text = text.replace('class="text-sm text-gray-700"', 'class="text-sm text-gray-700 dark:text-gray-300"')
text = text.replace('class="text-sm text-gray-600"', 'class="text-sm text-gray-600 dark:text-gray-400"')
text = text.replace('class="text-xs text-gray-600"', 'class="text-xs text-gray-600 dark:text-gray-400"')
text = text.replace('class="bg-gray-50 rounded-xl p-6"', 'class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"')
text = text.replace('class="text-lg font-semibold text-gray-900 mb-4"', 'class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4"')
text = text.replace('class="font-medium"', 'class="font-medium dark:text-gray-200"')
text = text.replace('class="font-medium dark:text-gray-200 text-green-600"', 'class="font-medium text-green-600"')
text = text.replace('class="font-medium dark:text-gray-200 text-blue-600"', 'class="font-medium text-blue-600"')
text = text.replace('class="font-medium dark:text-gray-200 text-purple-600"', 'class="font-medium text-purple-600"')
text = text.replace('class="font-medium dark:text-gray-200 text-orange-600"', 'class="font-medium text-orange-600"')
text = text.replace('class="text-lg font-semibold text-gray-900"', 'class="text-lg font-semibold text-gray-900 dark:text-gray-100"')
text = text.replace('class="font-medium dark:text-gray-200 transition-colors"', 'class="font-medium transition-colors"')


with open('src/app/components/quiz-menu/quiz-menu.component.html', 'w', encoding='utf-8') as f:
    f.write(text)

print('Replaced')
