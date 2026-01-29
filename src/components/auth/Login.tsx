import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Lock } from '../../utils/icons';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Acesso Administrativo
          </h1>
          <p className="text-gray-600">
            Entre com suas credenciais para acessar o painel
          </p>
        </div>

        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none p-0 w-full',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
                formButtonPrimary: 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700',
                footerAction: 'hidden'
              }
            }}
            routing="hash"
            signUpUrl="/sign-up"
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Acesso restrito apenas para administradores
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
