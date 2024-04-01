const namingConventions = [
  {
    selector: 'variable',
    format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
  },
  {
    selector: 'memberLike',
    format: ['camelCase', 'PascalCase'],
  },
  {
    selector: 'typeLike',
    format: ['PascalCase'],
  },
  {
    selector: 'property',
    filter: '(_id)',
    format: null,
    leadingUnderscore: 'allow',
  },
  {
    selector: 'parameterProperty',
    format: ['camelCase', 'PascalCase'],
    filter: {
      regex: '[- ]|',
      match: false,
    },
  },
];


module.exports = {
  'env': {
    'browser': true,
    'es2021': true
  },
  'plugins': [
    'react',
    '@typescript-eslint',
    'import',
    'json',
    '@typescript-eslint',
    'prettier',
  ],
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:import/typescript',
    'airbnb',
    'plugin:prettier/recommended',
  ],
  'overrides': [
    {
      'env': {
        'node': true
      },
      'files': [
        '.eslintrc.{js,cjs}'
      ],
      'parserOptions': {
        'sourceType': 'script'
      }
    }
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module'
  },
  
  'rules': {
    '@typescript-eslint/no-non-null-assertion': 'off',
    'prettier/prettier': [
      'error',
      {
        tabWidth: 2,
        semi: true,
        singleQuote: true,
        arrowParens: 'avoid',
      },
    ],
    'global-require': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'no-shadow': 'off',
    '@typescript-eslint/no-redeclare': ['error'],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/naming-convention': ['error'].concat(namingConventions),
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'comma',
          requireLast: true,
        },
        overrides: {
          interface: {
            multiline: {
              delimiter: 'semi',
              requireLast: true,
            },
          },
          typeLiteral: {
            multiline: {
              delimiter: 'semi',
              requireLast: true,
            },
          },
        },
        singleline: {
          delimiter: 'comma',
          requireLast: false,
        },
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
      },
    ],
    'arrow-parens': ['error', 'as-needed'],
    'consistent-return': [
      'error',
      {
        treatUndefinedAsUnspecified: false,
      },
    ],
    'func-names': [
      'error',
      'as-needed',
      {
        generators: 'never',
      },
    ],
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-relative-packages': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'max-len': [
      'error',
      {
        code: 120,
      },
    ],
    'no-param-reassign': [
      'error',
      {
        ignorePropertyModificationsFor: ['state'],
        props: true,
      },
    ],
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
      },
    ],
    'no-useless-escape': 'off',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'lodash',
            importNames: ['sample'],
            message:
              'You probably want to use `sample` from `effector` instead?',
          },
        ],
      },
    ],
    'react/jsx-filename-extension': [
      'error',
      {
        extensions: ['.jsx', '.tsx'],
      },
    ],
    'react/prop-types': 'off',
    'react/sort-comp': [
      'error',
      {
        order: [
          'instance-variables',
          'static-methods',
          'lifecycle',
          'render',
          'everything-else',
        ],
      },
    ],
    'react/state-in-constructor': ['error', 'never'],
    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        labelComponents: ['CustomInputLabel'],
        labelAttributes: ['label'],
        controlComponents: ['CustomInput'],
        depth: 3,
      },
    ],
    'react/jsx-props-no-spreading': 'off',
    'no-underscore-dangle': 'off',
    'dot-notation': 'error',
    'react/function-component-definition': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off', // !!!
    'no-unused-vars': 'off',
    'max-lines': ['error', 400],
    'react/require-default-props': 'off',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-useless-constructor': 'off',
  }
};
