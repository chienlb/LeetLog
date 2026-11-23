import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Entry } from '../src/models/Entry.js';
import { User } from '../src/models/User.js';

dotenv.config();

const USER_ID = '6b03b6970f5b282f7958745f';

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Status = 'Solved' | 'Review' | 'Attempted';
type SolutionLanguage = 'TypeScript' | 'Go' | 'Rust' | 'C++';

interface SeedSolution {
  language: SolutionLanguage;
  code: string;
}

interface SeedEntry {
  title: string;
  slug: string;
  difficulty: Difficulty;
  topics: string[];
  status: Status;
  daysAgo: number;
  timeSpentMinutes: number | null;
  notes: string;
  solutions?: SeedSolution[];
}

const SAMPLE_SOLUTIONS: Record<string, SeedSolution[]> = {
  'two-sum': [
    {
      language: 'TypeScript',
      code: `function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need)!, i];
    seen.set(nums[i], i);
  }
  return [];
}`,
    },
    {
      language: 'Go',
      code: `func twoSum(nums []int, target int) []int {
  seen := map[int]int{}
  for i, n := range nums {
    if j, ok := seen[target-n]; ok {
      return []int{j, i}
    }
    seen[n] = i
  }
  return nil
}`,
    },
    {
      language: 'Rust',
      code: `use std::collections::HashMap;

pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    let mut seen = HashMap::new();
    for (i, &n) in nums.iter().enumerate() {
        if let Some(&j) = seen.get(&(target - n)) {
            return vec![j as i32, i as i32];
        }
        seen.insert(n, i);
    }
    vec![]
}`,
    },
    {
      language: 'C++',
      code: `vector<int> twoSum(vector<int>& nums, int target) {
  unordered_map<int, int> seen;
  for (int i = 0; i < (int)nums.size(); ++i) {
    auto it = seen.find(target - nums[i]);
    if (it != seen.end()) return {it->second, i};
    seen[nums[i]] = i;
  }
  return {};
}`,
    },
  ],
  'valid-parentheses': [
    {
      language: 'TypeScript',
      code: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') stack.push(ch);
    else if (stack.pop() !== map[ch]) return false;
  }
  return stack.length === 0;
}`,
    },
    {
      language: 'Go',
      code: `func isValid(s string) bool {
  stack := []rune{}
  pair := map[rune]rune{')': '(', ']': '[', '}': '{'}
  for _, ch := range s {
    if ch == '(' || ch == '[' || ch == '{' {
      stack = append(stack, ch)
      continue
    }
    if len(stack) == 0 || stack[len(stack)-1] != pair[ch] {
      return false
    }
    stack = stack[:len(stack)-1]
  }
  return len(stack) == 0
}`,
    },
  ],
  'maximum-subarray': [
    {
      language: 'Rust',
      code: `pub fn max_sub_array(nums: Vec<i32>) -> i32 {
    let mut best = nums[0];
    let mut cur = nums[0];
    for &n in nums.iter().skip(1) {
        cur = n.max(cur + n);
        best = best.max(cur);
    }
    best
}`,
    },
    {
      language: 'C++',
      code: `int maxSubArray(vector<int>& nums) {
  int best = nums[0], cur = nums[0];
  for (size_t i = 1; i < nums.size(); ++i) {
    cur = max(nums[i], cur + nums[i]);
    best = max(best, cur);
  }
  return best;
}`,
    },
  ],
};

function sampleSolutionsFor(slug: string, index: number): SeedSolution[] {
  if (SAMPLE_SOLUTIONS[slug]) return SAMPLE_SOLUTIONS[slug];
  if (index % 4 !== 0) return [];

  const langs: SolutionLanguage[] = ['TypeScript', 'Go', 'Rust', 'C++'];
  const pick = langs.filter((_, i) => (index + i) % 3 !== 0).slice(0, 1 + (index % 3));
  return pick.map((language) => ({
    language,
    code: `// ${language} solution draft for ${slug}\n// TODO: polish edge cases\n`,
  }));
}

const seeds: SeedEntry[] = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    topics: ['Array', 'Hash Table'],
    status: 'Solved',
    daysAgo: 2,
    timeSpentMinutes: 18,
    notes: 'Hash map for O(n).',
    solutions: SAMPLE_SOLUTIONS['two-sum'],
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    topics: ['Stack', 'String'],
    status: 'Solved',
    daysAgo: 3,
    timeSpentMinutes: 12,
    notes: 'Classic stack matching.',
    solutions: SAMPLE_SOLUTIONS['valid-parentheses'],
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    difficulty: 'Easy',
    topics: ['Array', 'DP'],
    status: 'Solved',
    daysAgo: 5,
    timeSpentMinutes: 22,
    notes: 'Track min price while scanning.',
  },
  {
    title: 'Linked List Cycle',
    slug: 'linked-list-cycle',
    difficulty: 'Easy',
    topics: ['Linked List', 'Two Pointers'],
    status: 'Solved',
    daysAgo: 7,
    timeSpentMinutes: 15,
    notes: 'Floyd tortoise and hare.',
  },
  {
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'Easy',
    topics: ['Array', 'Binary Search'],
    status: 'Solved',
    daysAgo: 8,
    timeSpentMinutes: 10,
    notes: '',
  },
  {
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    difficulty: 'Easy',
    topics: ['DP', 'Math'],
    status: 'Solved',
    daysAgo: 10,
    timeSpentMinutes: 14,
    notes: 'Fibonacci DP.',
  },
  {
    title: 'Invert Binary Tree',
    slug: 'invert-binary-tree',
    difficulty: 'Easy',
    topics: ['Tree', 'BFS', 'DFS'],
    status: 'Solved',
    daysAgo: 12,
    timeSpentMinutes: 11,
    notes: '',
  },
  {
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    difficulty: 'Medium',
    topics: ['Array', 'DP', 'Divide and Conquer'],
    status: 'Solved',
    daysAgo: 4,
    timeSpentMinutes: 35,
    notes: 'Kadane’s algorithm.',
    solutions: SAMPLE_SOLUTIONS['maximum-subarray'],
  },
  {
    title: '3Sum',
    slug: '3sum',
    difficulty: 'Medium',
    topics: ['Array', 'Two Pointers', 'Sorting'],
    status: 'Review',
    daysAgo: 6,
    timeSpentMinutes: 48,
    notes: 'Sort + two pointers; skip duplicates carefully.',
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    topics: ['Hash Table', 'String', 'Sliding Window'],
    status: 'Solved',
    daysAgo: 9,
    timeSpentMinutes: 40,
    notes: 'Sliding window with last-seen index.',
  },
  {
    title: 'Product of Array Except Self',
    slug: 'product-of-array-except-self',
    difficulty: 'Medium',
    topics: ['Array', 'Prefix Sum'],
    status: 'Solved',
    daysAgo: 11,
    timeSpentMinutes: 32,
    notes: 'Prefix/suffix products, O(1) extra space.',
  },
  {
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    difficulty: 'Medium',
    topics: ['Array', 'Two Pointers', 'Greedy'],
    status: 'Solved',
    daysAgo: 14,
    timeSpentMinutes: 28,
    notes: '',
  },
  {
    title: 'Number of Islands',
    slug: 'number-of-islands',
    difficulty: 'Medium',
    topics: ['DFS', 'BFS', 'Matrix'],
    status: 'Solved',
    daysAgo: 16,
    timeSpentMinutes: 45,
    notes: 'DFS flood fill on grid.',
  },
  {
    title: 'Course Schedule',
    slug: 'course-schedule',
    difficulty: 'Medium',
    topics: ['Graph', 'DFS', 'Topo Sort'],
    status: 'Review',
    daysAgo: 18,
    timeSpentMinutes: 55,
    notes: 'Detect cycle in directed graph.',
  },
  {
    title: 'LRU Cache',
    slug: 'lru-cache',
    difficulty: 'Medium',
    topics: ['Hash Table', 'Linked List', 'Design'],
    status: 'Attempted',
    daysAgo: 1,
    timeSpentMinutes: 70,
    notes: 'Map + doubly linked list; still polishing edge cases.',
  },
  {
    title: 'Word Break',
    slug: 'word-break',
    difficulty: 'Medium',
    topics: ['DP', 'Trie', 'String'],
    status: 'Solved',
    daysAgo: 20,
    timeSpentMinutes: 50,
    notes: 'DP[i] = can segment s[0..i).',
  },
  {
    title: 'Coin Change',
    slug: 'coin-change',
    difficulty: 'Medium',
    topics: ['DP', 'BFS'],
    status: 'Solved',
    daysAgo: 22,
    timeSpentMinutes: 42,
    notes: '',
  },
  {
    title: 'House Robber',
    slug: 'house-robber',
    difficulty: 'Medium',
    topics: ['DP', 'Array'],
    status: 'Solved',
    daysAgo: 25,
    timeSpentMinutes: 30,
    notes: '',
  },
  {
    title: 'Validate Binary Search Tree',
    slug: 'validate-binary-search-tree',
    difficulty: 'Medium',
    topics: ['Tree', 'DFS'],
    status: 'Solved',
    daysAgo: 28,
    timeSpentMinutes: 38,
    notes: 'Pass valid range down the recursion.',
  },
  {
    title: 'Kth Largest Element in an Array',
    slug: 'kth-largest-element-in-an-array',
    difficulty: 'Medium',
    topics: ['Heap', 'Quickselect', 'Sorting'],
    status: 'Solved',
    daysAgo: 30,
    timeSpentMinutes: 36,
    notes: '',
  },
  {
    title: 'Merge Intervals',
    slug: 'merge-intervals',
    difficulty: 'Medium',
    topics: ['Array', 'Sorting'],
    status: 'Solved',
    daysAgo: 33,
    timeSpentMinutes: 27,
    notes: '',
  },
  {
    title: 'Search in Rotated Sorted Array',
    slug: 'search-in-rotated-sorted-array',
    difficulty: 'Medium',
    topics: ['Array', 'Binary Search'],
    status: 'Review',
    daysAgo: 35,
    timeSpentMinutes: 44,
    notes: 'Decide which half is sorted each step.',
  },
  {
    title: 'Combination Sum',
    slug: 'combination-sum',
    difficulty: 'Medium',
    topics: ['Backtracking', 'Array'],
    status: 'Solved',
    daysAgo: 38,
    timeSpentMinutes: 41,
    notes: '',
  },
  {
    title: 'Rotting Oranges',
    slug: 'rotting-oranges',
    difficulty: 'Medium',
    topics: ['BFS', 'Matrix', 'Queue'],
    status: 'Solved',
    daysAgo: 42,
    timeSpentMinutes: 39,
    notes: 'Multi-source BFS.',
  },
  {
    title: 'Decode Ways',
    slug: 'decode-ways',
    difficulty: 'Medium',
    topics: ['DP', 'String'],
    status: 'Attempted',
    daysAgo: 15,
    timeSpentMinutes: 60,
    notes: 'Edge cases with 0 still confusing.',
  },
  {
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    difficulty: 'Hard',
    topics: ['Array', 'Two Pointers', 'Stack'],
    status: 'Solved',
    daysAgo: 21,
    timeSpentMinutes: 75,
    notes: 'Two pointers with left/right max.',
  },
  {
    title: 'Median of Two Sorted Arrays',
    slug: 'median-of-two-sorted-arrays',
    difficulty: 'Hard',
    topics: ['Array', 'Binary Search', 'Divide and Conquer'],
    status: 'Attempted',
    daysAgo: 13,
    timeSpentMinutes: 90,
    notes: 'Need another pass on partition logic.',
  },
  {
    title: 'Merge k Sorted Lists',
    slug: 'merge-k-sorted-lists',
    difficulty: 'Hard',
    topics: ['Linked List', 'Heap', 'Divide and Conquer'],
    status: 'Solved',
    daysAgo: 40,
    timeSpentMinutes: 65,
    notes: 'Min-heap of list heads.',
  },
  {
    title: 'Word Ladder',
    slug: 'word-ladder',
    difficulty: 'Hard',
    topics: ['BFS', 'Hash Table', 'String'],
    status: 'Review',
    daysAgo: 45,
    timeSpentMinutes: 80,
    notes: 'BFS on word graph; optimize neighbor generation.',
  },
  {
    title: 'Serialize and Deserialize Binary Tree',
    slug: 'serialize-and-deserialize-binary-tree',
    difficulty: 'Hard',
    topics: ['Tree', 'DFS', 'BFS', 'Design'],
    status: 'Solved',
    daysAgo: 50,
    timeSpentMinutes: 70,
    notes: '',
  },
  {
    title: 'Longest Consecutive Sequence',
    slug: 'longest-consecutive-sequence',
    difficulty: 'Medium',
    topics: ['Array', 'Hash Table'],
    status: 'Solved',
    daysAgo: 55,
    timeSpentMinutes: 34,
    notes: 'Set + only start from sequence heads.',
  },
  {
    title: 'Find Median from Data Stream',
    slug: 'find-median-from-data-stream',
    difficulty: 'Hard',
    topics: ['Heap', 'Design'],
    status: 'Review',
    daysAgo: 60,
    timeSpentMinutes: 85,
    notes: 'Two heaps: max-left / min-right.',
  },
  {
    title: 'Palindrome Linked List',
    slug: 'palindrome-linked-list',
    difficulty: 'Easy',
    topics: ['Linked List', 'Two Pointers'],
    status: 'Solved',
    daysAgo: 65,
    timeSpentMinutes: 25,
    notes: '',
  },
  {
    title: 'Subtree of Another Tree',
    slug: 'subtree-of-another-tree',
    difficulty: 'Easy',
    topics: ['Tree', 'DFS', 'String'],
    status: 'Solved',
    daysAgo: 70,
    timeSpentMinutes: 20,
    notes: '',
  },
  {
    title: 'Daily Temperatures',
    slug: 'daily-temperatures',
    difficulty: 'Medium',
    topics: ['Stack', 'Array', 'Monotonic Stack'],
    status: 'Solved',
    daysAgo: 75,
    timeSpentMinutes: 33,
    notes: 'Monotonic decreasing stack of indices.',
  },
  {
    title: 'Top K Frequent Elements',
    slug: 'top-k-frequent-elements',
    difficulty: 'Medium',
    topics: ['Heap', 'Hash Table', 'Bucket Sort'],
    status: 'Solved',
    daysAgo: 80,
    timeSpentMinutes: 29,
    notes: '',
  },
  {
    title: 'Clone Graph',
    slug: 'clone-graph',
    difficulty: 'Medium',
    topics: ['Graph', 'DFS', 'BFS', 'Hash Table'],
    status: 'Solved',
    daysAgo: 90,
    timeSpentMinutes: 37,
    notes: '',
  },
  {
    title: 'Pacific Atlantic Water Flow',
    slug: 'pacific-atlantic-water-flow',
    difficulty: 'Medium',
    topics: ['DFS', 'BFS', 'Matrix'],
    status: 'Solved',
    daysAgo: 100,
    timeSpentMinutes: 58,
    notes: 'Multi-source DFS from both oceans.',
  },
  {
    title: 'Minimum Window Substring',
    slug: 'minimum-window-substring',
    difficulty: 'Hard',
    topics: ['Hash Table', 'String', 'Sliding Window'],
    status: 'Attempted',
    daysAgo: 48,
    timeSpentMinutes: 95,
    notes: 'Need need/have counters clean-up.',
  },
  {
    title: 'Alien Dictionary',
    slug: 'alien-dictionary',
    difficulty: 'Hard',
    topics: ['Graph', 'Topo Sort', 'String'],
    status: 'Review',
    daysAgo: 110,
    timeSpentMinutes: 88,
    notes: 'Build graph from consecutive word pairs.',
  },
  // Spread older activity for heatmap density
  {
    title: 'Same Tree',
    slug: 'same-tree',
    difficulty: 'Easy',
    topics: ['Tree', 'DFS'],
    status: 'Solved',
    daysAgo: 120,
    timeSpentMinutes: 8,
    notes: '',
  },
  {
    title: 'Symmetric Tree',
    slug: 'symmetric-tree',
    difficulty: 'Easy',
    topics: ['Tree', 'BFS', 'DFS'],
    status: 'Solved',
    daysAgo: 135,
    timeSpentMinutes: 16,
    notes: '',
  },
  {
    title: 'Path Sum',
    slug: 'path-sum',
    difficulty: 'Easy',
    topics: ['Tree', 'DFS'],
    status: 'Solved',
    daysAgo: 150,
    timeSpentMinutes: 14,
    notes: '',
  },
  {
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    difficulty: 'Easy',
    topics: ['Linked List'],
    status: 'Solved',
    daysAgo: 165,
    timeSpentMinutes: 12,
    notes: '',
  },
  {
    title: 'Merge Two Sorted Lists',
    slug: 'merge-two-sorted-lists',
    difficulty: 'Easy',
    topics: ['Linked List', 'Recursion'],
    status: 'Solved',
    daysAgo: 180,
    timeSpentMinutes: 15,
    notes: '',
  },
  {
    title: 'Group Anagrams',
    slug: 'group-anagrams',
    difficulty: 'Medium',
    topics: ['Hash Table', 'String', 'Sorting'],
    status: 'Solved',
    daysAgo: 200,
    timeSpentMinutes: 26,
    notes: '',
  },
  {
    title: 'Jump Game',
    slug: 'jump-game',
    difficulty: 'Medium',
    topics: ['Array', 'Greedy', 'DP'],
    status: 'Solved',
    daysAgo: 220,
    timeSpentMinutes: 31,
    notes: '',
  },
  {
    title: 'Unique Paths',
    slug: 'unique-paths',
    difficulty: 'Medium',
    topics: ['DP', 'Math', 'Combinatorics'],
    status: 'Solved',
    daysAgo: 250,
    timeSpentMinutes: 24,
    notes: '',
  },
  {
    title: 'Edit Distance',
    slug: 'edit-distance',
    difficulty: 'Hard',
    topics: ['DP', 'String'],
    status: 'Solved',
    daysAgo: 280,
    timeSpentMinutes: 72,
    notes: 'Classic 2D DP.',
  },
  {
    title: 'Largest Rectangle in Histogram',
    slug: 'largest-rectangle-in-histogram',
    difficulty: 'Hard',
    topics: ['Array', 'Stack', 'Monotonic Stack'],
    status: 'Review',
    daysAgo: 310,
    timeSpentMinutes: 95,
    notes: 'Monotonic stack of increasing heights.',
  },
];

const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const statuses: Status[] = ['Solved', 'Review', 'Attempted'];
const topicPools = [
  ['Array'],
  ['String'],
  ['Hash Table'],
  ['DP'],
  ['Tree', 'DFS'],
  ['Graph', 'BFS'],
  ['Two Pointers'],
  ['Binary Search'],
  ['Stack'],
  ['Heap'],
  ['Sliding Window', 'String'],
  ['Backtracking'],
  ['Greedy'],
  ['Linked List'],
  ['Math'],
  ['Matrix', 'DFS'],
];

const bulkTitles = [
  'Add Two Numbers',
  'Longest Palindromic Substring',
  'Zigzag Conversion',
  'Reverse Integer',
  'String to Integer',
  'Palindrome Number',
  'Regular Expression Matching',
  'Integer to Roman',
  'Roman to Integer',
  'Longest Common Prefix',
  'Letter Combinations of a Phone Number',
  '4Sum',
  'Remove Nth Node From End of List',
  'Generate Parentheses',
  'Swap Nodes in Pairs',
  'Remove Duplicates from Sorted Array',
  'Remove Element',
  'Find the Index of the First Occurrence',
  'Divide Two Integers',
  'Substring with Concatenation of All Words',
  'Next Permutation',
  'Search Insert Position',
  'Valid Sudoku',
  'Sudoku Solver',
  'Count and Say',
  'First Missing Positive',
  'Wildcard Matching',
  'Pow(x, n)',
  'Spiral Matrix',
  'Jump Game II',
  'Permutations',
  'Permutations II',
  'Rotate Image',
  'Anagrams Group Extra',
  'N-Queens',
  'N-Queens II',
  'Maximum Depth of Binary Tree',
  'Convert Sorted Array to BST',
  'Balanced Binary Tree',
  'Minimum Depth of Binary Tree',
  'Flatten Binary Tree to Linked List',
  'Distinct Subsequences',
  'Populating Next Right Pointers',
  'Pascal Triangle',
  'Pascal Triangle II',
  'Triangle',
  'Best Time to Buy and Sell Stock II',
  'Best Time to Buy and Sell Stock III',
  'Binary Tree Maximum Path Sum',
  'Valid Palindrome',
  'Word Ladder II',
  'Sum Root to Leaf Numbers',
  'Surrounded Regions',
  'Palindrome Partitioning',
  'Palindrome Partitioning II',
  'Gas Station',
  'Candy',
  'Single Number',
  'Single Number II',
  'Copy List with Random Pointer',
  'Word Break II',
  'Linked List Cycle II',
  'Reorder List',
  'Binary Tree Preorder Traversal',
  'Binary Tree Postorder Traversal',
  'Insertion Sort List',
  'Sort List',
  'Max Points on a Line',
  'Evaluate Reverse Polish Notation',
  'Maximal Rectangle',
  'Interleaving String',
  'Recover Binary Search Tree',
  'Same Tree Extra',
  'Construct Binary Tree from Preorder',
  'Construct Binary Tree from Inorder',
  'Binary Tree Level Order Traversal',
  'Binary Tree Zigzag Level Order',
  'Convert Sorted List to BST',
  'Path Sum II',
  'Flatten Nested List Iterator',
  'Implement Trie',
  'Design Add and Search Words',
  'Word Search II',
  'House Robber II',
  'Shortest Palindrome',
  'The Skyline Problem',
  'Contains Duplicate',
  'Contains Duplicate II',
  'Contains Duplicate III',
  'Maximal Square',
  'Count Complete Tree Nodes',
  'Rectangle Area',
  'Basic Calculator',
  'Basic Calculator II',
  'Summary Ranges',
  'Majority Element II',
  'Kth Smallest Element in BST',
  'Power of Two',
  'Implement Queue using Stacks',
  'Implement Stack using Queues',
  'Palindrome Pairs',
  'Game of Life',
  'Find the Duplicate Number',
  'Ugly Number',
  'Ugly Number II',
  'Missing Number',
  'First Bad Version',
  'Find Peak Element',
  'H-Index',
  'H-Index II',
  'Integer to English Words',
  'Perfect Squares',
  'Move Zeroes',
  'Peeking Iterator',
  'Nim Game',
  'Word Pattern',
  'Bulls and Cows',
  'Longest Increasing Subsequence',
  'Remove Invalid Parentheses',
  'Range Sum Query Immutable',
  'Range Sum Query Mutable',
  'Additive Number',
  'Range Sum Query 2D',
  'Burst Balloons',
  'Super Ugly Number',
  'Count of Smaller Numbers After Self',
  'Remove Duplicate Letters',
  'Max Sum of Rectangle No Larger Than K',
  'Nested List Weight Sum',
  'Design Snake Game',
  'Android Unlock Patterns',
  'Data Stream as Disjoint Intervals',
  'Design Hit Counter',
  'Frog Jump',
  'Wiggle Sort II',
  'Power of Three',
  'Count of Range Sum',
  'Odd Even Linked List',
  'Longest Increasing Path in Matrix',
  'Patching Array',
  'Verify Preorder Serialization',
  'Reconstruct Itinerary',
  'Increasing Triplet Subsequence',
  'Self Crossing',
  'Palindrome Pairs Extra',
  'House Robber III',
  'Counting Bits',
  'Nested List Weight Sum II',
  'Integer Break',
  'Power of Four',
  'Reverse String',
  'Reverse Vowels of a String',
  'Top K Frequent Words',
  'Intersection of Two Arrays',
  'Intersection of Two Arrays II',
  'Valid Perfect Square',
  'Sum of Two Integers',
];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildBulkSeeds(count: number): SeedEntry[] {
  const out: SeedEntry[] = [];
  for (let i = 0; i < count; i += 1) {
    const titleBase = bulkTitles[i % bulkTitles.length];
    const title = i < bulkTitles.length ? titleBase : `${titleBase} #${Math.floor(i / bulkTitles.length) + 1}`;
    const slug = slugify(title);
    out.push({
      title,
      slug,
      difficulty: difficulties[i % difficulties.length],
      topics: topicPools[i % topicPools.length],
      status: statuses[i % statuses.length],
      daysAgo: (i % 360) + 1,
      timeSpentMinutes: 8 + ((i * 7) % 90),
      notes: i % 5 === 0 ? 'Bulk seed for pagination testing.' : '',
      solutions: sampleSolutionsFor(slug, i),
    });
  }
  return out;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing');

  await mongoose.connect(uri);

  const user = await User.findById(USER_ID).lean();
  if (!user) {
    throw new Error(`User ${USER_ID} not found`);
  }

  console.log(`Seeding for ${user.name} <${user.email}>`);

  const deleted = await Entry.deleteMany({ userId: USER_ID });
  console.log(`Cleared ${deleted.deletedCount} existing entries`);

  const allSeeds = [...seeds, ...buildBulkSeeds(160)];
  const now = Date.now();
  const docs = allSeeds.map((s, index) => ({
    userId: new mongoose.Types.ObjectId(USER_ID),
    title: s.title,
    slug: s.slug,
    difficulty: s.difficulty,
    topics: s.topics,
    status: s.status,
    solvedAt: new Date(now - s.daysAgo * 24 * 60 * 60 * 1000),
    timeSpentMinutes: s.timeSpentMinutes,
    notes: s.notes,
    solutions: s.solutions ?? sampleSolutionsFor(s.slug, index),
  }));

  const inserted = await Entry.insertMany(docs);
  console.log(`Inserted ${inserted.length} entries`);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
