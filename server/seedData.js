/**
 * seedData.js
 * Pre-populated dataset for Nebula 2026 Coding Challenge
 * Contains 20 curated DSA & Aptitude questions and 80 pre-generated teams.
 */

const starterTemplates = {
  python: `# Read input from standard input (stdin)
# Print output to standard output (stdout)
import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    # Write your logic here
    pass

if __name__ == '__main__':
    solve()
`,
  java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        // Write your logic here
        
        sc.close();
    }
}
`,
  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Write your logic here
    
    return 0;
}
`,
  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Write your logic here
    
    return 0;
}
`
};

const defaultQuestions = [
  {
    id: 1,
    title: "Two Sum Target Pair",
    category: "Arrays & Hashing",
    type: "coding",
    difficulty: "Easy",
    timeLimit: 600, // 10 minutes in seconds
    unlockedLetter: "N",
    description: `Given an array of integers \`nums\` and an integer \`target\`, find the two indices (0-indexed) of the numbers such that they add up to \`target\`.

Assume that each input will have exactly one solution, and you may not use the same element twice. Print the two indices separated by a space in ascending order.`,
    inputFormat: `First line contains integer \`N\` (number of elements) and integer \`target\`.
Second line contains \`N\` space-separated integers representing \`nums\`.`,
    outputFormat: `Print the two 0-indexed positions separated by a space (e.g. "0 1").`,
    constraints: `2 <= N <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9`,
    sampleTestCases: [
      {
        input: "4 9\n2 7 11 15",
        output: "0 1",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9. Hence indices are 0 and 1."
      },
      {
        input: "3 6\n3 2 4",
        output: "1 2",
        explanation: "nums[1] + nums[2] = 2 + 4 = 6. Hence indices are 1 and 2."
      }
    ],
    hiddenTestCases: [
      {
        input: "4 15\n2 7 8 11",
        output: "1 2"
      },
      {
        input: "4 -2\n-5 3 -2 1",
        output: "0 1"
      }
    ],
    starterCode: {
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    target = int(lines[1])
    nums = [int(x) for x in lines[2:2+n]]
    
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            print(f"{lookup[complement]} {i}")
            return
        lookup[num] = i

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;
import java.util.HashMap;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) {
                System.out.println(map.get(comp) + " " + i);
                return;
            }
            map.put(nums[i], i);
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    
    unordered_map<int, int> mp;
    for (int i = 0; i < n; i++) {
        int comp = target - nums[i];
        if (mp.find(comp) != mp.end()) {
            cout << mp[comp] << " " << i << "\\n";
            return 0;
        }
        mp[nums[i]] = i;
    }
    return 0;
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;
    int *nums = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                printf("%d %d\\n", i, j);
                free(nums);
                return 0;
            }
        }
    }
    free(nums);
    return 0;
}
`
    }
  },
  {
    id: 2,
    title: "Valid Parentheses Check",
    category: "Stack",
    type: "coding",
    difficulty: "Easy",
    timeLimit: 600,
    unlockedLetter: "E",
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Print \`true\` if the string is valid, or \`false\` otherwise.`,
    inputFormat: `A single line containing the string \`s\`.`,
    outputFormat: `Print \`true\` or \`false\`.`,
    constraints: `1 <= s.length <= 10^4`,
    sampleTestCases: [
      {
        input: "()[]{}",
        output: "true",
        explanation: "All brackets open and close in correct sequence."
      },
      {
        input: "(]",
        output: "false",
        explanation: "Mismatched closing bracket."
      }
    ],
    hiddenTestCases: [
      {
        input: "{[()]}",
        output: "true"
      },
      {
        input: "([)]",
        output: "false"
      }
    ],
    starterCode: {
      python: `import sys

def is_valid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return len(stack) == 0

if __name__ == '__main__':
    s = sys.stdin.read().strip()
    if not s:
        print("true")
    else:
        print("true" if is_valid(s) else "false")
`,
      java: `import java.util.Scanner;
import java.util.Stack;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) {
            System.out.println("true");
            return;
        }
        String s = sc.next();
        Stack<Character> stack = new Stack<>();
        boolean valid = true;
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) { valid = false; break; }
                char top = stack.pop();
                if ((c == ')' && top != '(') || (c == '}' && top != '{') || (c == ']' && top != '[')) {
                    valid = false;
                    break;
                }
            }
        }
        if (!stack.isEmpty()) valid = false;
        System.out.println(valid ? "true" : "false");
    }
}
`,
      cpp: `#include <iostream>
#include <stack>
#include <string>

using namespace std;

int main() {
    string s;
    if (!(cin >> s)) {
        cout << "true\\n";
        return 0;
    }
    stack<char> st;
    bool valid = true;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            if (st.empty()) { valid = false; break; }
            char top = st.top(); st.pop();
            if ((c == ')' && top != '(') || (c == '}' && top != '{') || (c == ']' && top != '[')) {
                valid = false; break;
            }
        }
    }
    if (!st.empty()) valid = false;
    cout << (valid ? "true" : "false") << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>

int main() {
    char s[10005];
    if (scanf("%s", s) != 1) {
        printf("true\\n");
        return 0;
    }
    char stack[10005];
    int top = -1;
    bool valid = true;
    for (int i = 0; s[i] != '\\0'; i++) {
        char c = s[i];
        if (c == '(' || c == '{' || c == '[') {
            stack[++top] = c;
        } else {
            if (top == -1) { valid = false; break; }
            char t = stack[top--];
            if ((c == ')' && t != '(') || (c == '}' && t != '{') || (c == ']' && t != '[')) {
                valid = false; break;
            }
        }
    }
    if (top != -1) valid = false;
    printf(valid ? "true\\n" : "false\\n");
    return 0;
}
`
    }
  },
  {
    id: 3,
    title: "Maximum Subarray (Kadane's Algorithm)",
    category: "Dynamic Programming",
    type: "coding",
    difficulty: "Medium",
    timeLimit: 600,
    unlockedLetter: "B",
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and print its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    inputFormat: `First line contains integer \`N\` (number of elements).
Second line contains \`N\` space-separated integers.`,
    outputFormat: `Print a single integer representing the maximum subarray sum.`,
    constraints: `1 <= N <= 10^5\n-10^4 <= nums[i] <= 10^4`,
    sampleTestCases: [
      {
        input: "9\n-2 1 -3 4 -1 2 1 -5 4",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6."
      },
      {
        input: "1\n1",
        output: "1",
        explanation: "Single element max sum is 1."
      }
    ],
    hiddenTestCases: [
      {
        input: "5\n5 4 -1 7 8",
        output: "23"
      },
      {
        input: "4\n-3 -2 -1 -4",
        output: "-1"
      }
    ],
    starterCode: {
      python: `import sys

def max_subarray():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:1+n]]
    
    max_so_far = nums[0]
    curr_max = nums[0]
    for x in nums[1:]:
        curr_max = max(x, curr_max + x)
        max_so_far = max(max_so_far, curr_max)
    print(max_so_far)

if __name__ == '__main__':
    max_subarray()
`,
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        long maxSoFar = sc.nextLong();
        long currMax = maxSoFar;
        for (int i = 1; i < n; i++) {
            long x = sc.nextLong();
            currMax = Math.max(x, currMax + x);
            maxSoFar = Math.max(maxSoFar, currMax);
        }
        System.out.println(maxSoFar);
    }
}
`,
      cpp: `#include <iostream>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    long long max_so_far, curr_max, x;
    cin >> max_so_far;
    curr_max = max_so_far;
    for (int i = 1; i < n; i++) {
        cin >> x;
        curr_max = max(x, curr_max + x);
        max_so_far = max(max_so_far, curr_max);
    }
    cout << max_so_far << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    long long max_so_far, curr_max, x;
    scanf("%lld", &max_so_far);
    curr_max = max_so_far;
    for (int i = 1; i < n; i++) {
        scanf("%lld", &x);
        curr_max = (x > curr_max + x) ? x : (curr_max + x);
        max_so_far = (max_so_far > curr_max) ? max_so_far : curr_max;
    }
    printf("%lld\\n", max_so_far);
    return 0;
}
`
    }
  },
  {
    id: 4,
    title: "Longest Substring Without Repeating Characters",
    category: "Sliding Window",
    type: "coding",
    difficulty: "Medium",
    timeLimit: 600,
    unlockedLetter: "U",
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
    inputFormat: `A single line containing the string \`s\`.`,
    outputFormat: `Print a single integer representing the length of the longest non-repeating substring.`,
    constraints: `0 <= s.length <= 5 * 10^4`,
    sampleTestCases: [
      {
        input: "abcabcbb",
        output: "3",
        explanation: "The answer is 'abc', with the length of 3."
      },
      {
        input: "bbbbb",
        output: "1",
        explanation: "The answer is 'b', with the length of 1."
      }
    ],
    hiddenTestCases: [
      {
        input: "pwwkew",
        output: "3"
      },
      {
        input: "abcdefg",
        output: "7"
      }
    ],
    starterCode: {
      python: `import sys

def length_of_longest_substring(s):
    char_index = {}
    max_len = 0
    left = 0
    for right, c in enumerate(s):
        if c in char_index and char_index[c] >= left:
            left = char_index[c] + 1
        char_index[c] = right
        max_len = max(max_len, right - left + 1)
    return max_len

if __name__ == '__main__':
    s = sys.stdin.readline().rstrip('\\r\\n')
    print(length_of_longest_substring(s))
`,
      java: `import java.util.Scanner;
import java.util.HashMap;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine().trim() : "";
        HashMap<Character, Integer> map = new HashMap<>();
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        System.out.println(maxLen);
    }
}
`,
      cpp: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    string s;
    if (!getline(cin, s)) {
        cout << 0 << "\\n";
        return 0;
    }
    vector<int> last(256, -1);
    int max_len = 0, left = 0;
    for (int right = 0; right < (int)s.length(); right++) {
        unsigned char c = s[right];
        if (last[c] >= left) {
            left = last[c] + 1;
        }
        last[c] = right;
        max_len = max(max_len, right - left + 1);
    }
    cout << max_len << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[50005];
    if (!fgets(s, sizeof(s), stdin)) {
        printf("0\\n");
        return 0;
    }
    int len = strlen(s);
    while (len > 0 && (s[len-1] == '\\n' || s[len-1] == '\\r')) s[--len] = '\\0';
    int last[256];
    for (int i = 0; i < 256; i++) last[i] = -1;
    int max_len = 0, left = 0;
    for (int right = 0; right < len; right++) {
        unsigned char c = s[right];
        if (last[c] >= left) left = last[c] + 1;
        last[c] = right;
        int cur = right - left + 1;
        if (cur > max_len) max_len = cur;
    }
    printf("%d\\n", max_len);
    return 0;
}
`
    }
  },
  {
    id: 5,
    title: "Best Time to Buy and Sell Stock",
    category: "Arrays",
    type: "coding",
    difficulty: "Easy",
    timeLimit: 600,
    unlockedLetter: "L",
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`-th day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Print the maximum profit you can achieve from this transaction. If you cannot achieve any profit, print \`0\`.`,
    inputFormat: `First line contains integer \`N\` (number of days).
Second line contains \`N\` space-separated integers representing prices.`,
    outputFormat: `Print the maximum possible profit.`,
    constraints: `1 <= N <= 10^5\n0 <= prices[i] <= 10^4`,
    sampleTestCases: [
      {
        input: "6\n7 1 5 3 6 4",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5."
      },
      {
        input: "5\n7 6 4 3 1",
        output: "0",
        explanation: "No profitable transactions possible."
      }
    ],
    hiddenTestCases: [
      {
        input: "4\n1 2 3 4",
        output: "3"
      },
      {
        input: "5\n2 4 1 7 5",
        output: "6"
      }
    ],
    starterCode: {
      python: `import sys

def max_profit():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    prices = [int(x) for x in data[1:1+n]]
    
    min_price = float('inf')
    max_prof = 0
    for p in prices:
        if p < min_price:
            min_price = p
        elif p - min_price > max_prof:
            max_prof = p - min_price
    print(max_prof)

if __name__ == '__main__':
    max_profit()
`,
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int i = 0; i < n; i++) {
            int p = sc.nextInt();
            if (p < minPrice) minPrice = p;
            else if (p - minPrice > maxProfit) maxProfit = p - minPrice;
        }
        System.out.println(maxProfit);
    }
}
`,
      cpp: `#include <iostream>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    int min_price = 1e9, max_profit = 0, p;
    for (int i = 0; i < n; i++) {
        cin >> p;
        min_price = min(min_price, p);
        max_profit = max(max_profit, p - min_price);
    }
    cout << max_profit << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int min_price = 1000000000, max_profit = 0, p;
    for (int i = 0; i < n; i++) {
        scanf("%d", &p);
        if (p < min_price) min_price = p;
        else if (p - min_price > max_profit) max_profit = p - min_price;
    }
    printf("%d\\n", max_profit);
    return 0;
}
`
    }
  },
  {
    id: 6,
    title: "Search in Rotated Sorted Array",
    category: "Binary Search",
    type: "coding",
    difficulty: "Medium",
    timeLimit: 600,
    unlockedLetter: "A",
    description: `There is an integer array \`nums\` sorted in ascending order (with distinct values).

Prior to being passed to your function, \`nums\` is possibly rotated at an unknown pivot index \`k\` (1 <= k < nums.length).

Given the array \`nums\` and an integer \`target\`, print the 0-based index of \`target\` if it is in \`nums\`, or \`-1\` if it is not in \`nums\`. Your algorithm should achieve O(log n) time complexity.`,
    inputFormat: `First line contains integer \`N\` and integer \`target\`.
Second line contains \`N\` space-separated integers representing the rotated array.`,
    outputFormat: `Print the index of target or -1.`,
    constraints: `1 <= N <= 10^5\n-10^9 <= nums[i], target <= 10^9`,
    sampleTestCases: [
      {
        input: "7 0\n4 5 6 7 0 1 2",
        output: "4",
        explanation: "Element 0 is at index 4."
      },
      {
        input: "7 3\n4 5 6 7 0 1 2",
        output: "-1",
        explanation: "Element 3 is not present in the array."
      }
    ],
    hiddenTestCases: [
      {
        input: "1 0\n0",
        output: "0"
      },
      {
        input: "5 1\n5 1 2 3 4",
        output: "1"
      }
    ],
    starterCode: {
      python: `import sys

def search_rotated():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    target = int(data[1])
    nums = [int(x) for x in data[2:2+n]]
    
    left, right = 0, n - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            print(mid)
            return
        if nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    print(-1)

if __name__ == '__main__':
    search_rotated()
`,
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        
        int left = 0, right = n - 1;
        int ans = -1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) { ans = mid; break; }
            if (nums[left] <= nums[mid]) {
                if (nums[left] <= target && target < nums[mid]) right = mid - 1;
                else left = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[right]) left = mid + 1;
                else right = mid - 1;
            }
        }
        System.out.println(ans);
    }
}
`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    
    int left = 0, right = n - 1, ans = -1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) { ans = mid; break; }
        if (nums[left] <= nums[mid]) {
            if (nums[left] <= target && target < nums[mid]) right = mid - 1;
            else left = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[right]) left = mid + 1;
            else right = mid - 1;
        }
    }
    cout << ans << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;
    int *nums = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    
    int left = 0, right = n - 1, ans = -1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) { ans = mid; break; }
        if (nums[left] <= nums[mid]) {
            if (nums[left] <= target && target < nums[mid]) right = mid - 1;
            else left = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[right]) left = mid + 1;
            else right = mid - 1;
        }
    }
    printf("%d\\n", ans);
    free(nums);
    return 0;
}
`
    }
  },
  {
    id: 7,
    title: "Find Missing Number in Sequence",
    category: "Math & Bit Manipulation",
    type: "coding",
    difficulty: "Easy",
    timeLimit: 600,
    unlockedLetter: "2",
    description: `Given an array \`nums\` containing \`n\` distinct numbers in the range \`[0, n]\`, print the only number in the range that is missing from the array.`,
    inputFormat: `First line contains integer \`N\` (number of elements in array).
Second line contains \`N\` distinct space-separated integers in the range \`[0, N]\`.`,
    outputFormat: `Print the single missing integer.`,
    constraints: `1 <= N <= 10^5\nAll elements of nums are unique and between 0 and N.`,
    sampleTestCases: [
      {
        input: "3\n3 0 1",
        output: "2",
        explanation: "n = 3, range [0,3], missing number is 2."
      },
      {
        input: "2\n0 1",
        output: "2",
        explanation: "n = 2, range [0,2], missing number is 2."
      }
    ],
    hiddenTestCases: [
      {
        input: "9\n9 6 4 2 3 5 7 0 1",
        output: "8"
      },
      {
        input: "1\n0",
        output: "1"
      }
    ],
    starterCode: {
      python: `import sys

def missing_number():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    nums = [int(x) for x in data[1:1+n]]
    
    expected_sum = n * (n + 1) // 2
    actual_sum = sum(nums)
    print(expected_sum - actual_sum)

if __name__ == '__main__':
    missing_number()
`,
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        long expected = (long) n * (n + 1) / 2;
        long actual = 0;
        for (int i = 0; i < n; i++) actual += sc.nextLong();
        System.out.println(expected - actual);
    }
}
`,
      cpp: `#include <iostream>

using namespace std;

int main() {
    long long n;
    if (!(cin >> n)) return 0;
    long long expected = n * (n + 1) / 2;
    long long actual = 0, val;
    for (int i = 0; i < n; i++) {
        cin >> val;
        actual += val;
    }
    cout << (expected - actual) << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    long long n;
    if (scanf("%lld", &n) != 1) return 0;
    long long expected = n * (n + 1) / 2;
    long long actual = 0, val;
    for (int i = 0; i < n; i++) {
        scanf("%lld", &val);
        actual += val;
    }
    printf("%lld\\n", expected - actual);
    return 0;
}
`
    }
  },
  {
    id: 8,
    title: "Climbing Stairs (Ways to Reach N)",
    category: "Dynamic Programming",
    type: "coding",
    difficulty: "Easy",
    timeLimit: 600,
    unlockedLetter: "6",
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    inputFormat: `A single integer \`n\`.`,
    outputFormat: `Print the total number of distinct ways to climb to the top.`,
    constraints: `1 <= n <= 45`,
    sampleTestCases: [
      {
        input: "2",
        output: "2",
        explanation: "1. 1 step + 1 step\n2. 2 steps"
      },
      {
        input: "3",
        output: "3",
        explanation: "1. 1 + 1 + 1\n2. 1 + 2\n3. 2 + 1"
      }
    ],
    hiddenTestCases: [
      {
        input: "4",
        output: "5"
      },
      {
        input: "10",
        output: "89"
      }
    ],
    starterCode: {
      python: `import sys

def climb_stairs(n):
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b

if __name__ == '__main__':
    inp = sys.stdin.read().strip()
    if inp:
        print(climb_stairs(int(inp)))
`,
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        if (n <= 2) { System.out.println(n); return; }
        long a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            long temp = a + b;
            a = b;
            b = temp;
        }
        System.out.println(b);
    }
}
`,
      cpp: `#include <iostream>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    if (n <= 2) { cout << n << "\\n"; return 0; }
    long long a = 1, b = 2;
    for (int i = 3; i <= n; i++) {
        long long next = a + b;
        a = b;
        b = next;
    }
    cout << b << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    if (n <= 2) { printf("%d\\n", n); return 0; }
    long long a = 1, b = 2;
    for (int i = 3; i <= n; i++) {
        long long next = a + b;
        a = b;
        b = next;
    }
    printf("%lld\\n", b);
    return 0;
}
`
    }
  },
  {
    id: 9,
    title: "Move Zeroes to End",
    category: "Arrays & Two Pointers",
    type: "coding",
    difficulty: "Easy",
    timeLimit: 600,
    unlockedLetter: "C",
    description: `Given an integer array \`nums\`, move all \`0\`'s to the end of it while maintaining the relative order of the non-zero elements.

Note that you must do this in-place without making a copy of the array. Print the modified array as space-separated integers.`,
    inputFormat: `First line contains integer \`N\`.
Second line contains \`N\` space-separated integers.`,
    outputFormat: `Print the space-separated modified array.`,
    constraints: `1 <= N <= 10^4\n-2^31 <= nums[i] <= 2^31 - 1`,
    sampleTestCases: [
      {
        input: "5\n0 1 0 3 12",
        output: "1 3 12 0 0",
        explanation: "Non-zeros 1, 3, 12 maintain relative order, zeros pushed to end."
      },
      {
        input: "1\n0",
        output: "0",
        explanation: "Single zero remains 0."
      }
    ],
    hiddenTestCases: [
      {
        input: "4\n4 2 4 0",
        output: "4 2 4 0"
      },
      {
        input: "4\n0 0 1 2",
        output: "1 2 0 0"
      }
    ],
    starterCode: {
      python: `import sys

def move_zeroes():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    nums = [int(x) for x in data[1:1+n]]
    
    insert_pos = 0
    for num in nums:
        if num != 0:
            nums[insert_pos] = num
            insert_pos += 1
    while insert_pos < n:
        nums[insert_pos] = 0
        insert_pos += 1
        
    print(" ".join(map(str, nums)))

if __name__ == '__main__':
    move_zeroes()
`,
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        int pos = 0;
        for (int i = 0; i < n; i++) {
            int val = sc.nextInt();
            if (val != 0) nums[pos++] = val;
        }
        while (pos < n) nums[pos++] = 0;
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(nums[i]);
            if (i < n - 1) sb.append(" ");
        }
        System.out.println(sb.toString());
    }
}
`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n, 0);
    int pos = 0;
    for (int i = 0; i < n; i++) {
        int val;
        cin >> val;
        if (val != 0) nums[pos++] = val;
    }
    for (int i = 0; i < n; i++) {
        cout << nums[i] << (i + 1 < n ? " " : "");
    }
    cout << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int *nums = (int*)calloc(n, sizeof(int));
    int pos = 0;
    for (int i = 0; i < n; i++) {
        int val;
        scanf("%d", &val);
        if (val != 0) nums[pos++] = val;
    }
    for (int i = 0; i < n; i++) {
        printf("%d%s", nums[i], (i + 1 < n ? " " : ""));
    }
    printf("\\n");
    free(nums);
    return 0;
}
`
    }
  },
  {
    id: 10,
    title: "Valid Anagram Verification",
    category: "Strings & Hashing",
    type: "coding",
    difficulty: "Easy",
    timeLimit: 600,
    unlockedLetter: "O",
    description: `Given two strings \`s\` and \`t\`, print \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An Anagram is a word formed by rearranging the letters of a different word, typically using all the original letters exactly once.`,
    inputFormat: `Two lines or two space-separated words: string \`s\` and string \`t\`.`,
    outputFormat: `Print \`true\` or \`false\`.`,
    constraints: `1 <= s.length, t.length <= 5 * 10^4\ns and t consist of lowercase English letters.`,
    sampleTestCases: [
      {
        input: "anagram nagaram",
        output: "true",
        explanation: "Both strings have identical frequency of letters."
      },
      {
        input: "rat car",
        output: "false",
        explanation: "Different characters."
      }
    ],
    hiddenTestCases: [
      {
        input: "listen silent",
        output: "true"
      },
      {
        input: "hello world",
        output: "false"
      }
    ],
    starterCode: {
      python: `import sys
from collections import Counter

def is_anagram():
    data = sys.stdin.read().split()
    if len(data) < 2:
        return
    s, t = data[0], data[1]
    print("true" if Counter(s) == Counter(t) else "false")

if __name__ == '__main__':
    is_anagram()
`,
      java: `import java.util.Scanner;
import java.util.Arrays;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        String t = sc.next();
        if (s.length() != t.length()) {
            System.out.println("false");
            return;
        }
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
            count[t.charAt(i) - 'a']--;
        }
        for (int c : count) {
            if (c != 0) {
                System.out.println("false");
                return;
            }
        }
        System.out.println("true");
    }
}
`,
      cpp: `#include <iostream>
#include <string>
#include <vector>

using namespace std;

int main() {
    string s, t;
    if (!(cin >> s >> t)) return 0;
    if (s.length() != t.length()) {
        cout << "false\\n";
        return 0;
    }
    vector<int> cnt(26, 0);
    for (int i = 0; i < (int)s.length(); i++) {
        cnt[s[i] - 'a']++;
        cnt[t[i] - 'a']--;
    }
    for (int c : cnt) {
        if (c != 0) {
            cout << "false\\n";
            return 0;
        }
    }
    cout << "true\\n";
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[50005], t[50005];
    if (scanf("%s %s", s, t) != 2) return 0;
    if (strlen(s) != strlen(t)) {
        printf("false\\n");
        return 0;
    }
    int cnt[26] = {0};
    for (int i = 0; s[i] != '\\0'; i++) {
        cnt[s[i] - 'a']++;
        cnt[t[i] - 'a']--;
    }
    for (int i = 0; i < 26; i++) {
        if (cnt[i] != 0) {
            printf("false\\n");
            return 0;
        }
    }
    printf("true\\n");
    return 0;
}
`
    }
  },
  {
    id: 11,
    title: "Majority Element",
    category: "Arrays & Boyer-Moore",
    type: "coding",
    difficulty: "Easy",
    timeLimit: 600,
    unlockedLetter: "D",
    description: `Given an array \`nums\` of size \`n\`, print the majority element.

The majority element is the element that appears more than \`⌊n / 2⌋\` times. You may assume that the majority element always exists in the array.`,
    inputFormat: `First line contains integer \`N\`.
Second line contains \`N\` space-separated integers.`,
    outputFormat: `Print the single majority element.`,
    constraints: `1 <= N <= 5 * 10^4\n-10^9 <= nums[i] <= 10^9`,
    sampleTestCases: [
      {
        input: "3\n3 2 3",
        output: "3",
        explanation: "3 appears 2 times, which is > 3 / 2."
      },
      {
        input: "7\n2 2 1 1 1 2 2",
        output: "2",
        explanation: "2 appears 4 times, which is > 7 / 2."
      }
    ],
    hiddenTestCases: [
      {
        input: "1\n100",
        output: "100"
      },
      {
        input: "5\n6 5 5 5 2",
        output: "5"
      }
    ],
    starterCode: {
      python: `import sys

def majority_element():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    nums = [int(x) for x in data[1:1+n]]
    
    count = 0
    candidate = None
    for num in nums:
        if count == 0:
            candidate = num
        count += (1 if num == candidate else -1)
    print(candidate)

if __name__ == '__main__':
    majority_element()
`,
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int candidate = 0, count = 0;
        for (int i = 0; i < n; i++) {
            int val = sc.nextInt();
            if (count == 0) candidate = val;
            count += (val == candidate) ? 1 : -1;
        }
        System.out.println(candidate);
    }
}
`,
      cpp: `#include <iostream>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    int candidate = 0, count = 0, val;
    for (int i = 0; i < n; i++) {
        cin >> val;
        if (count == 0) candidate = val;
        count += (val == candidate) ? 1 : -1;
    }
    cout << candidate << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int candidate = 0, count = 0, val;
    for (int i = 0; i < n; i++) {
        scanf("%d", &val);
        if (count == 0) candidate = val;
        count += (val == candidate) ? 1 : -1;
    }
    printf("%d\\n", candidate);
    return 0;
}
`
    }
  },
  {
    id: 12,
    title: "Palindrome Number Check",
    category: "Math",
    type: "coding",
    difficulty: "Easy",
    timeLimit: 600,
    unlockedLetter: "E",
    description: `Given an integer \`x\`, print \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a palindrome when it reads the same forward and backward. Note: negative numbers are not palindromes.`,
    inputFormat: `A single integer \`x\`.`,
    outputFormat: `Print \`true\` or \`false\`.`,
    constraints: `-2^31 <= x <= 2^31 - 1`,
    sampleTestCases: [
      {
        input: "121",
        output: "true",
        explanation: "121 reads as 121 from left to right and right to left."
      },
      {
        input: "-121",
        output: "false",
        explanation: "From left to right it reads -121, but from right to left it is 121-."
      }
    ],
    hiddenTestCases: [
      {
        input: "10",
        output: "false"
      },
      {
        input: "12321",
        output: "true"
      }
    ],
    starterCode: {
      python: `import sys

def is_palindrome():
    s = sys.stdin.read().strip()
    if not s:
        return
    print("true" if s == s[::-1] else "false")

if __name__ == '__main__':
    is_palindrome()
`,
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        String rev = new StringBuilder(s).reverse().toString();
        System.out.println(s.equals(rev) ? "true" : "false");
    }
}
`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;
    string rev = s;
    reverse(rev.begin(), rev.end());
    cout << (s == rev ? "true" : "false") << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[64];
    if (scanf("%s", s) != 1) return 0;
    int len = strlen(s);
    int is_pal = 1;
    for (int i = 0; i < len / 2; i++) {
        if (s[i] != s[len - 1 - i]) {
            is_pal = 0;
            break;
        }
    }
    printf(is_pal ? "true\\n" : "false\\n");
    return 0;
}
`
    }
  },
  {
    id: 13,
    title: "Contains Duplicate",
    category: "Arrays & Sets",
    type: "coding",
    difficulty: "Easy",
    timeLimit: 600,
    unlockedLetter: "F",
    description: `Given an integer array \`nums\`, print \`true\` if any value appears at least twice in the array, and print \`false\` if every element is distinct.`,
    inputFormat: `First line contains integer \`N\`.
Second line contains \`N\` space-separated integers.`,
    outputFormat: `Print \`true\` or \`false\`.`,
    constraints: `1 <= N <= 10^5\n-10^9 <= nums[i] <= 10^9`,
    sampleTestCases: [
      {
        input: "4\n1 2 3 1",
        output: "true",
        explanation: "1 appears twice."
      },
      {
        input: "4\n1 2 3 4",
        output: "false",
        explanation: "All elements are unique."
      }
    ],
    hiddenTestCases: [
      {
        input: "10\n1 1 1 3 3 4 3 2 4 2",
        output: "true"
      },
      {
        input: "1\n99",
        output: "false"
      }
    ],
    starterCode: {
      python: `import sys

def contains_duplicate():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    nums = [int(x) for x in data[1:1+n]]
    print("true" if len(nums) != len(set(nums)) else "false")

if __name__ == '__main__':
    contains_duplicate()
`,
      java: `import java.util.Scanner;
import java.util.HashSet;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        HashSet<Integer> set = new HashSet<>();
        boolean duplicate = false;
        for (int i = 0; i < n; i++) {
            int v = sc.nextInt();
            if (!set.add(v)) {
                duplicate = true;
            }
        }
        System.out.println(duplicate ? "true" : "false");
    }
}
`,
      cpp: `#include <iostream>
#include <unordered_set>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    unordered_set<int> st;
    bool duplicate = false;
    for (int i = 0; i < n; i++) {
        int v;
        cin >> v;
        if (!duplicate && st.count(v)) duplicate = true;
        st.insert(v);
    }
    cout << (duplicate ? "true" : "false") << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>

int compare(const void *a, const void *b) {
    long long diff = (*(long long*)a - *(long long*)b);
    return (diff > 0) - (diff < 0);
}

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    long long *arr = (long long*)malloc(n * sizeof(long long));
    for (int i = 0; i < n; i++) scanf("%lld", &arr[i]);
    qsort(arr, n, sizeof(long long), compare);
    int dup = 0;
    for (int i = 1; i < n; i++) {
        if (arr[i] == arr[i - 1]) {
            dup = 1;
            break;
        }
    }
    printf(dup ? "true\\n" : "false\\n");
    free(arr);
    return 0;
}
`
    }
  },
  {
    id: 14,
    title: "Merge Two Sorted Arrays",
    category: "Two Pointers",
    type: "coding",
    difficulty: "Easy",
    timeLimit: 600,
    unlockedLetter: "I",
    description: `You are given two sorted integer arrays \`nums1\` and \`nums2\`. Merge the two arrays into a single sorted array and print all elements in non-decreasing order separated by spaces.`,
    inputFormat: `First line contains \`M\` and \`N\` (sizes of nums1 and nums2).
Second line contains \`M\` sorted integers for nums1.
Third line contains \`N\` sorted integers for nums2.`,
    outputFormat: `Print the merged sorted integers separated by a single space.`,
    constraints: `0 <= M, N <= 10^4\nM + N >= 1\n-10^9 <= elements <= 10^9`,
    sampleTestCases: [
      {
        input: "3 3\n1 2 3\n2 5 6",
        output: "1 2 2 3 5 6",
        explanation: "Merged and sorted sequence."
      },
      {
        input: "1 0\n1\n",
        output: "1",
        explanation: "nums2 is empty."
      }
    ],
    hiddenTestCases: [
      {
        input: "2 2\n2 4\n1 3",
        output: "1 2 3 4"
      },
      {
        input: "3 1\n4 5 6\n1",
        output: "1 4 5 6"
      }
    ],
    starterCode: {
      python: `import sys

def merge_sorted():
    data = sys.stdin.read().split()
    if not data:
        return
    m = int(data[0])
    n = int(data[1])
    idx = 2
    nums1 = [int(x) for x in data[idx:idx+m]]
    idx += m
    nums2 = [int(x) for x in data[idx:idx+n]]
    
    i, j = 0, 0
    res = []
    while i < m and j < n:
        if nums1[i] <= nums2[j]:
            res.append(nums1[i])
            i += 1
        else:
            res.append(nums2[j])
            j += 1
    res.extend(nums1[i:])
    res.extend(nums2[j:])
    print(" ".join(map(str, res)))

if __name__ == '__main__':
    merge_sorted()
`,
      java: `import java.util.Scanner;
import java.util.ArrayList;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();
        int[] a = new int[m];
        int[] b = new int[n];
        for (int i = 0; i < m; i++) a[i] = sc.nextInt();
        for (int i = 0; i < n; i++) b[i] = sc.nextInt();
        
        int i = 0, j = 0;
        StringBuilder sb = new StringBuilder();
        while (i < m && j < n) {
            if (a[i] <= b[j]) sb.append(a[i++]).append(" ");
            else sb.append(b[j++]).append(" ");
        }
        while (i < m) sb.append(a[i++]).append(" ");
        while (j < n) sb.append(b[j++]).append(" ");
        System.out.println(sb.toString().trim());
    }
}
`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;
    vector<int> a(m), b(n);
    for (int i = 0; i < m; i++) cin >> a[i];
    for (int i = 0; i < n; i++) cin >> b[i];
    
    int i = 0, j = 0;
    bool first = true;
    while (i < m && j < n) {
        if (!first) cout << " ";
        if (a[i] <= b[j]) cout << a[i++];
        else cout << b[j++];
        first = false;
    }
    while (i < m) {
        if (!first) cout << " ";
        cout << a[i++];
        first = false;
    }
    while (j < n) {
        if (!first) cout << " ";
        cout << b[j++];
        first = false;
    }
    cout << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;
    int *a = (int*)malloc(m * sizeof(int));
    int *b = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < m; i++) scanf("%d", &a[i]);
    for (int i = 0; i < n; i++) scanf("%d", &b[i]);
    
    int i = 0, j = 0, first = 1;
    while (i < m && j < n) {
        if (!first) printf(" ");
        if (a[i] <= b[j]) printf("%d", a[i++]);
        else printf("%d", b[j++]);
        first = 0;
    }
    while (i < m) {
        if (!first) printf(" ");
        printf("%d", a[i++]);
        first = 0;
    }
    while (j < n) {
        if (!first) printf(" ");
        printf("%d", b[j++]);
        first = 0;
    }
    printf("\\n");
    free(a);
    free(b);
    return 0;
}
`
    }
  },
  {
    id: 15,
    title: "First Unique Character in a String",
    category: "Strings & Hashing",
    type: "coding",
    difficulty: "Easy",
    timeLimit: 600,
    unlockedLetter: "R",
    description: `Given a string \`s\`, find the first non-repeating character in it and print its 0-based index. If it does not exist, print \`-1\`.`,
    inputFormat: `A single line containing string \`s\`.`,
    outputFormat: `Print the index of the first unique character or \`-1\`.`,
    constraints: `1 <= s.length <= 10^5\ns consists of only lowercase English letters.`,
    sampleTestCases: [
      {
        input: "leetcode",
        output: "0",
        explanation: "Character 'l' at index 0 does not repeat."
      },
      {
        input: "loveleetcode",
        output: "2",
        explanation: "Character 'v' at index 2 is the first unique."
      }
    ],
    hiddenTestCases: [
      {
        input: "aabb",
        output: "-1"
      },
      {
        input: "z",
        output: "0"
      }
    ],
    starterCode: {
      python: `import sys
from collections import Counter

def first_unique_char():
    s = sys.stdin.read().strip()
    if not s:
        print(-1)
        return
    count = Counter(s)
    for i, c in enumerate(s):
        if count[c] == 1:
            print(i)
            return
    print(-1)

if __name__ == '__main__':
    first_unique_char()
`,
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        int[] freq = new int[26];
        for (int i = 0; i < s.length(); i++) freq[s.charAt(i) - 'a']++;
        for (int i = 0; i < s.length(); i++) {
            if (freq[s.charAt(i) - 'a'] == 1) {
                System.out.println(i);
                return;
            }
        }
        System.out.println(-1);
    }
}
`,
      cpp: `#include <iostream>
#include <string>
#include <vector>

using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;
    vector<int> freq(26, 0);
    for (char c : s) freq[c - 'a']++;
    for (int i = 0; i < (int)s.length(); i++) {
        if (freq[s[i] - 'a'] == 1) {
            cout << i << "\\n";
            return 0;
        }
    }
    cout << -1 << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[100005];
    if (scanf("%s", s) != 1) return 0;
    int freq[26] = {0};
    for (int i = 0; s[i] != '\\0'; i++) freq[s[i] - 'a']++;
    for (int i = 0; s[i] != '\\0'; i++) {
        if (freq[s[i] - 'a'] == 1) {
            printf("%d\\n", i);
            return 0;
        }
    }
    printf("-1\\n");
    return 0;
}
`
    }
  },
  {
    id: 16,
    title: "Search Insert Position",
    category: "Binary Search",
    type: "coding",
    difficulty: "Easy",
    timeLimit: 600,
    unlockedLetter: "S",
    description: `Given a sorted array of distinct integers and a target value, print the index if the target is found. If not, print the index where it would be if it were inserted in order.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    inputFormat: `First line contains integer \`N\` and integer \`target\`.
Second line contains \`N\` space-separated integers.`,
    outputFormat: `Print the index of target or its insert position.`,
    constraints: `1 <= N <= 10^4\n-10^4 <= nums[i], target <= 10^4`,
    sampleTestCases: [
      {
        input: "4 5\n1 3 5 6",
        output: "2",
        explanation: "5 is found at index 2."
      },
      {
        input: "4 2\n1 3 5 6",
        output: "1",
        explanation: "2 is not found, would be inserted at index 1."
      }
    ],
    hiddenTestCases: [
      {
        input: "4 7\n1 3 5 6",
        output: "4"
      },
      {
        input: "4 0\n1 3 5 6",
        output: "0"
      }
    ],
    starterCode: {
      python: `import sys

def search_insert():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    target = int(data[1])
    nums = [int(x) for x in data[2:2+n]]
    
    left, right = 0, n - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            print(mid)
            return
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    print(left)

if __name__ == '__main__':
    search_insert()
`,
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        
        int left = 0, right = n - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) {
                System.out.println(mid);
                return;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        System.out.println(left);
    }
}
`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            cout << mid << "\\n";
            return 0;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    cout << left << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;
    int *nums = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            printf("%d\\n", mid);
            free(nums);
            return 0;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    printf("%d\\n", left);
    free(nums);
    return 0;
}
`
    }
  },
  {
    id: 17,
    title: "Intersection of Two Arrays",
    category: "Arrays & Sets",
    type: "coding",
    difficulty: "Easy",
    timeLimit: 600,
    unlockedLetter: "T",
    description: `Given two integer arrays \`nums1\` and \`nums2\`, print an array of their intersection. Each element in the result must be unique and elements must be printed in ascending order separated by a space.`,
    inputFormat: `First line contains \`N1\` and \`N2\` (number of elements in nums1 and nums2).
Second line contains \`N1\` space-separated integers.
Third line contains \`N2\` space-separated integers.`,
    outputFormat: `Print the unique common elements in ascending order separated by a space.`,
    constraints: `1 <= N1, N2 <= 1000\n0 <= nums1[i], nums2[i] <= 1000`,
    sampleTestCases: [
      {
        input: "4 2\n1 2 2 1\n2 2",
        output: "2",
        explanation: "Only 2 appears in both arrays."
      },
      {
        input: "5 3\n4 9 5 4 4\n9 4 9",
        output: "4 9",
        explanation: "Unique common elements in sorted order are 4 and 9."
      }
    ],
    hiddenTestCases: [
      {
        input: "3 3\n1 2 3\n4 5 6",
        output: ""
      },
      {
        input: "3 3\n3 2 1\n1 2 3",
        output: "1 2 3"
      }
    ],
    starterCode: {
      python: `import sys

def intersection():
    data = sys.stdin.read().split()
    if not data:
        return
    n1 = int(data[0])
    n2 = int(data[1])
    idx = 2
    nums1 = set(int(x) for x in data[idx:idx+n1])
    idx += n1
    nums2 = set(int(x) for x in data[idx:idx+n2])
    
    res = sorted(list(nums1.intersection(nums2)))
    print(" ".join(map(str, res)))

if __name__ == '__main__':
    intersection()
`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n1 = sc.nextInt();
        int n2 = sc.nextInt();
        HashSet<Integer> set1 = new HashSet<>();
        for (int i = 0; i < n1; i++) set1.add(sc.nextInt());
        TreeSet<Integer> common = new TreeSet<>();
        for (int i = 0; i < n2; i++) {
            int val = sc.nextInt();
            if (set1.contains(val)) common.add(val);
        }
        StringBuilder sb = new StringBuilder();
        for (int val : common) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(val);
        }
        System.out.println(sb.toString());
    }
}
`,
      cpp: `#include <iostream>
#include <set>
#include <vector>

using namespace std;

int main() {
    int n1, n2;
    if (!(cin >> n1 >> n2)) return 0;
    set<int> s1, common;
    for (int i = 0; i < n1; i++) { int x; cin >> x; s1.insert(x); }
    for (int i = 0; i < n2; i++) {
        int x; cin >> x;
        if (s1.count(x)) common.insert(x);
    }
    bool first = true;
    for (int x : common) {
        if (!first) cout << " ";
        cout << x;
        first = false;
    }
    cout << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n1, n2;
    if (scanf("%d %d", &n1, &n2) != 2) return 0;
    int has1[1001] = {0};
    int has2[1001] = {0};
    for (int i = 0; i < n1; i++) { int x; scanf("%d", &x); if(x>=0&&x<=1000) has1[x] = 1; }
    for (int i = 0; i < n2; i++) { int x; scanf("%d", &x); if(x>=0&&x<=1000) has2[x] = 1; }
    int first = 1;
    for (int i = 0; i <= 1000; i++) {
        if (has1[i] && has2[i]) {
            if (!first) printf(" ");
            printf("%d", i);
            first = 0;
        }
    }
    printf("\\n");
    return 0;
}
`
    }
  },
  {
    id: 18,
    title: "Aptitude: Clock Hands Angle",
    category: "Aptitude & Logic",
    type: "coding",
    difficulty: "Medium",
    timeLimit: 600,
    unlockedLetter: "W",
    description: `Given two integers \`hours\` (1 to 12) and \`minutes\` (0 to 59), calculate the smaller angle (in degrees, rounded to the nearest integer) formed between the hour hand and the minute hand of a traditional 12-hour clock.

Example formula:
- Hour hand moves 0.5 degrees per minute and 30 degrees per hour.
- Minute hand moves 6 degrees per minute.
- Calculate absolute difference and print \`min(diff, 360 - diff)\` rounded to the nearest integer.`,
    inputFormat: `A single line containing \`hours\` and \`minutes\` separated by a space.`,
    outputFormat: `Print the smaller angle in degrees (integer).`,
    constraints: `1 <= hours <= 12\n0 <= minutes <= 59`,
    sampleTestCases: [
      {
        input: "3 30",
        output: "75",
        explanation: "At 3:30, angle between hands is 75 degrees."
      },
      {
        input: "12 30",
        output: "165",
        explanation: "At 12:30, angle between hands is 165 degrees."
      }
    ],
    hiddenTestCases: [
      {
        input: "3 15",
        output: "8"
      },
      {
        input: "12 0",
        output: "0"
      }
    ],
    starterCode: {
      python: `import sys

def clock_angle():
    data = sys.stdin.read().split()
    if not data:
        return
    h = int(data[0]) % 12
    m = int(data[1])
    
    h_angle = h * 30 + m * 0.5
    m_angle = m * 6.0
    diff = abs(h_angle - m_angle)
    smaller = min(diff, 360.0 - diff)
    print(round(smaller))

if __name__ == '__main__':
    clock_angle()
`,
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int h = sc.nextInt() % 12;
        int m = sc.nextInt();
        double hAngle = h * 30.0 + m * 0.5;
        double mAngle = m * 6.0;
        double diff = Math.abs(hAngle - mAngle);
        double angle = Math.min(diff, 360.0 - diff);
        System.out.println(Math.round(angle));
    }
}
`,
      cpp: `#include <iostream>
#include <cmath>

using namespace std;

int main() {
    int h, m;
    if (!(cin >> h >> m)) return 0;
    h = h % 12;
    double h_angle = h * 30.0 + m * 0.5;
    double m_angle = m * 6.0;
    double diff = fabs(h_angle - m_angle);
    double angle = min(diff, 360.0 - diff);
    cout << (int)round(angle) << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>
#include <math.h>

int main() {
    int h, m;
    if (scanf("%d %d", &h, &m) != 2) return 0;
    h = h % 12;
    double h_angle = h * 30.0 + m * 0.5;
    double m_angle = m * 6.0;
    double diff = fabs(h_angle - m_angle);
    double angle = (diff < 360.0 - diff) ? diff : (360.0 - diff);
    printf("%d\\n", (int)round(angle));
    return 0;
}
`
    }
  },
  {
    id: 19,
    title: "Aptitude: Train Crossing Speed & Distance",
    category: "Aptitude & Math",
    type: "coding",
    difficulty: "Easy",
    timeLimit: 600,
    unlockedLetter: "I",
    description: `A train running at a speed of \`S\` km/hr crosses a stationary pole in \`T\` seconds.

What is the length of the train in meters? (Round to the nearest integer).

Formula:
\`Speed in m/s = S * (5 / 18)\`
\`Length in meters = Speed * T\``,
    inputFormat: `Two integers \`S\` (speed in km/h) and \`T\` (time in seconds) separated by space.`,
    outputFormat: `Print the length of the train in meters as an integer.`,
    constraints: `1 <= S <= 300\n1 <= T <= 300`,
    sampleTestCases: [
      {
        input: "60 9",
        output: "150",
        explanation: "60 * (5/18) * 9 = 150 meters."
      },
      {
        input: "72 10",
        output: "200",
        explanation: "72 * (5/18) * 10 = 200 meters."
      }
    ],
    hiddenTestCases: [
      {
        input: "36 15",
        output: "150"
      },
      {
        input: "108 5",
        output: "150"
      }
    ],
    starterCode: {
      python: `import sys

def train_length():
    data = sys.stdin.read().split()
    if not data:
        return
    s = float(data[0])
    t = float(data[1])
    length = s * (5.0 / 18.0) * t
    print(round(length))

if __name__ == '__main__':
    train_length()
`,
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextDouble()) return;
        double s = sc.nextDouble();
        double t = sc.nextDouble();
        double length = s * (5.0 / 18.0) * t;
        System.out.println(Math.round(length));
    }
}
`,
      cpp: `#include <iostream>
#include <cmath>

using namespace std;

int main() {
    double s, t;
    if (!(cin >> s >> t)) return 0;
    double length = s * (5.0 / 18.0) * t;
    cout << (long long)round(length) << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>
#include <math.h>

int main() {
    double s, t;
    if (scanf("%lf %lf", &s, &t) != 2) return 0;
    double length = s * (5.0 / 18.0) * t;
    printf("%lld\\n", (long long)round(length));
    return 0;
}
`
    }
  },
  {
    id: 20,
    title: "Aptitude: Work and Time Efficiency",
    category: "Aptitude & Logic",
    type: "coding",
    difficulty: "Medium",
    timeLimit: 600,
    unlockedLetter: "N",
    description: `Person A can finish a work in \`A\` days, and Person B can finish the same work in \`B\` days.

Working together, how many days will it take them to complete the work? Print the result rounded to two decimal places (e.g. \`2.40\`).

Formula:
\`Together = (A * B) / (A + B)\``,
    inputFormat: `Two positive integers \`A\` and \`B\` separated by space.`,
    outputFormat: `Print the number of days formatted to 2 decimal places.`,
    constraints: `1 <= A, B <= 1000`,
    sampleTestCases: [
      {
        input: "6 4",
        output: "2.40",
        explanation: "(6 * 4) / (6 + 4) = 24 / 10 = 2.40 days."
      },
      {
        input: "10 15",
        output: "6.00",
        explanation: "(10 * 15) / (10 + 15) = 150 / 25 = 6.00 days."
      }
    ],
    hiddenTestCases: [
      {
        input: "5 5",
        output: "2.50"
      },
      {
        input: "20 30",
        output: "12.00"
      }
    ],
    starterCode: {
      python: `import sys

def work_time():
    data = sys.stdin.read().split()
    if not data:
        return
    a = float(data[0])
    b = float(data[1])
    days = (a * b) / (a + b)
    print(f"{days:.2f}")

if __name__ == '__main__':
    work_time()
`,
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextDouble()) return;
        double a = sc.nextDouble();
        double b = sc.nextDouble();
        double days = (a * b) / (a + b);
        System.out.printf(java.util.Locale.US, "%.2f\\n", days);
    }
}
`,
      cpp: `#include <iostream>
#include <iomanip>

using namespace std;

int main() {
    double a, b;
    if (!(cin >> a >> b)) return 0;
    double days = (a * b) / (a + b);
    cout << fixed << setprecision(2) << days << "\\n";
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    double a, b;
    if (scanf("%lf %lf", &a, &b) != 2) return 0;
    double days = (a * b) / (a + b);
    printf("%.2f\\n", days);
    return 0;
}
`
    }
  }
];

// Generate 80 Teams
const teamAdjectives = [
  "Nebula", "Cyber", "Quantum", "Apex", "Binary", "Pixel", "Vanguard", "Nova",
  "Zenith", "Hyper", "Alpha", "Titan", "Cosmic", "Vortex", "Vector", "Matrix"
];
const teamNouns = [
  "Knights", "Warriors", "Pioneers", "Strikers", "Coders", "Titans", "Squad", "Wizards",
  "Devs", "Hawks", "Rangers", "Gladiators", "Dynamos", "Legion", "Phantoms", "Ninjas"
];

function generate80Teams() {
  const teams = [];
  for (let i = 1; i <= 80; i++) {
    const padded = String(i).padStart(2, '0');
    const adj = teamAdjectives[(i - 1) % teamAdjectives.length];
    const noun = teamNouns[Math.floor((i - 1) / teamAdjectives.length) % teamNouns.length];
    const name = `${adj} ${noun} ${padded}`;
    const id = `team${padded}`;
    const password = `nebula@${padded}`;

    teams.push({
      id,
      name,
      password,
      status: "ready", // ready, in_progress, completed, disqualified
      currentQuestionIndex: 0,
      questionStartTime: null,
      unlockedLetters: [],
      solvedQuestions: [],
      questionHistory: [],
      violations: 0,
      disqualifiedReason: null,
      startedAt: null,
      completedAt: null,
      totalScore: 0,
      lastActive: null
    });
  }
  return teams;
}

module.exports = {
  defaultQuestions,
  starterTemplates,
  generate80Teams
};
