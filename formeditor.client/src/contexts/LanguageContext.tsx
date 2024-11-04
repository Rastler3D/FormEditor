﻿import { createContext, createSignal, useContext, JSX, createMemo } from "solid-js";
import { makePersisted, storageSync } from "@solid-primitives/storage";
import * as i18n from "@solid-primitives/i18n";

type LanguageContextType = {
    language: () => Language;
    setLanguage: (lang: Language) => void;
    t: (key: Key, options?: any) => string;
};

const LanguageContext = createContext<LanguageContextType>();

export enum Language {
    En = "en",
    Ru = "ru"
}

const translations = {
    en: {
        TemplateManager: 'Template Manager',
        MyTemplates: 'My Templates',
        MyForms: 'My Forms',
        AllTemplates: 'All Templates',
        AllForms: 'All Forms',
        Search: 'Search',
        SelectLanguage: 'Select language',
        ToggleTheme: 'Toggle theme',
        UserMenu: 'User menu',
        SignedInAs: 'Signed in as',
        SignOut: 'Sign out',
        FormDetails: 'Form Details',
        Template: 'Template',
        SubmittedBy: 'Submitted by',
        SubmittedOn: 'Submitted on',
        Edit: 'Edit',
        Save: 'Save',
        Cancel: 'Cancel',
        SendFormViaEmail: 'Send form via email?',
        GeneralSettings: 'General Settings',
        Title: 'Title',
        Description: 'Description',
        Topic: 'Topic',
        Image: 'Image',
        Tags: 'Tags',
        AccessSetting: 'Access Setting',
        Public: 'Public',
        SpecifiedUsersOnly: 'Specified users only',
        SelectUsers: 'Select Users',
        UsersSelected: 'Users selected: ',
        FormAggregation: 'Form Aggregation',
        Summary: 'Summary',
        Chart: 'Chart',
        Average: 'Average',
        Minimum: 'Minimum',
        Maximum: 'Maximum',
        MostCommonAnswer: 'Most common answer',
        NumberOfUniqueAnswers: 'Number of unique answers',
        TrueCount: 'True count',
        FalseCount: 'False count',
        UserName: 'User name',
        FillingDate: 'Filling Date',
        SubmittedAt: 'Submitted at',
        Actions: 'Actions',
        View: 'View',
        Delete: 'Delete',
        DeletedForm: 'Successful form deletion',
        FailedToDeleteForm: 'Failed to delete form',
        SubmittedApplications: 'Submitted Application',
        Yes: 'Yes',
        No: 'No',
        FormSubmission: 'Form submission',
        Error: 'Error',
        SignInTo: 'Sign in',
        ToSubmitForm: 'to submit form',
        NoPermissionToFillForm: 'You have no permission to fill this form',
        Submit: 'Submit',
        FormSubmitted: 'Form submitted at',
        SignUp: 'Sign up',
        SignIn: 'Sign in',
        Profile: 'Profile',
        Forms: 'Forms',
        QuestionTitle: 'Question Title',
        QuestionDescription: 'Question Description',
        Options: 'Options',
        Add: 'Add',
        DisplayInTable: 'Display in table',
        SingleLine: "Single Line",
        MultiLine: "Multiple Lines",
        Integer: "Integer",
        Checkbox: "Checkbox",
        Select: "Select One",
        UniqueAnswers: "Unique Answers",
        SelectTopic: "Select Topic",
        Users: "Users",
        TemplateName: "Template Name",
        LatestTemplates: "Latest Templates",
        NoTemplatesAvailable: " There are no templates available at the moment.",
        PopularTemplates: "Popular Templates",
        NoTagsAvailable: "There are no tags available at the moment.",
        ExploreTags: "Explore Tags",
        CompleteLogin: "Please complete the login process...",
        DontHaveAccount: "Don't have an account?",
        OrContinueWith: "Or continue with",
        ForgotPassword: "Forgot Password?",
        Password: "Password",
        Email: "Email",
        EnterYourEmail: "Enter your email and password to access your account",
        SignUpTo: "Sign up",
        AlreadyHaveAccount: "Already have account?",
        CreateAccount: "Create account",
        CreateAnAccount: "Create an account to get started",
        SignUpPage: "Sign Up",
        SignInPage: "Sign In",
        BackToLogin: "Back to Login",
        ResendConfirmation: "Resend Confirmation",
        CheckSpam: "If you don't see the email, please check your spam folder.",
        VerificationSent: " We've sent a confirmation email to your registered email address.\n" +
            "                        Please check your inbox and click on the confirmation link to activate your account.",
        CheckEmail: "Please check your email to confirm your account",
        ConfirmYourEmail: "Confirm Your Email",
        SuccessfulExternalLogin: "Successful external login",
        ExternalLoginFailed: "External login failed",
        NoTagsFound: "No tags found",
        NoTemplatesFound: "No templates found",
        TemplateGallery: "Template Gallery",
        CreateNewTemplate: "Create new template",
        UseTemplate: "Use template",
        FillsCount: "Fills count",
        Author: "Author",
        Name: "Name",
        CreatedAt: "Created at",
        Avatar: "Avatar",
        Role: "Role",
        Status: "Status",
        Block: "Block",
        Unblock: "Unblock",
        MakeAdmin: "Make Admin",
        RemoveAdmin: "Remove Admin",
        UserManagement: "User Management",
        ConnectSalesforce: "Connect Salesforce",
        Phone: "Phone",
        Company: "Company",
        LastName: "Last Name",
        FirstName: "First Name",
        SalesforceAccountCreationFailed: "Failed to create Salesforce account",
        SalesforceAccountCreated: "Salesforce account created successfully",
        SalesforceDisconnected: "Salesforce integration disconnected",
        SalesforceDisconnectionFailed: "Failed to disconnect Salesforce integration",
        Tickets: "Tickets",
        Integrations: "Integrations",
        EditProfile: "Edit Profile",
        UpdateProfile: "Update Profile",
        ChangeAvatar: "Change Avatar",
        SalesforceIntegrationDescription: "Integration with Salesforce platform",
        SalesforceIntegration: "Salesforce Integration",
        CreateSalesforceAccountDescription: "Create the Salesforce account",
        Connect: "Connect",
        Disconnect: "Disconnect",
        Disconnected: "Disconnected",
        Connected: "Connected",
        ApiToken: "API Token",
        GenerateApiToken: "Generate API Token",
        ApiTokenDescription: "An API token is a unique key that allows you to securely integrate your profile with external platforms.",
        JiraAccountCreated: "Jira account connected successfully",
        JiraAccountCreationFailed: "Failed to connect Jira account",
        ConnectJira: "Connect Jira",
        CreateJiraAccountDescription: "Connect Jira account to the profile",
        JiraIntegration: "Jira Integration",
        JiraDisconnectionFailed: "Failed to disconnect Jira integration",
        JiraDisconnected: "Jira integration disconnected",
        JiraIntegrationDescription: "Integration with Jira platform for tickets management",
        TicketKey: "Ticket key",
        Priority: "Priority",
        OpenInJira: "Open in Jira",
        YourTickets: "Tickets",
    },
    ru: {
        TemplateManager: 'Менеджер шаблонов',
        MyTemplates: 'Мои шаблоны',
        MyForms: 'Мои формы',
        AllTemplates: 'Все шаблоны',
        AllForms: 'Все формы',
        Search: 'Поиск',
        SelectLanguage: 'Выбрать язык',
        ToggleTheme: 'Переключить тему',
        UserMenu: 'Меню пользователя',
        SignedInAs: 'Вы вошли как',
        SignOut: 'Выйти',
        FormDetails: 'Детали формы',
        Template: 'Шаблон',
        SubmittedBy: 'Имя отправителя',
        SubmittedOn: 'Отправлено',
        Edit: 'Редактировать',
        Save: 'Сохранить',
        Cancel: 'Отмена',
        SendFormViaEmail: 'Отправить форму по электронной почте?',
        GeneralSettings: 'Общие настройки',
        Title: 'Заголовок',
        Description: 'Описание',
        Topic: 'Тема',
        Image: 'Изображение',
        Tags: 'Теги',
        AccessSetting: 'Настройки доступа',
        Public: 'Публичный',
        SpecifiedUsersOnly: 'Только для указанных пользователей',
        SelectUsers: 'Выбрать пользователей',
        UsersSelected: 'Выбрано пользователей: ',
        FormAggregation: 'Агрегация форм',
        Summary: 'Сводка',
        Chart: 'График',
        Average: 'Среднее',
        Minimum: 'Минимум',
        Maximum: 'Максимум',
        MostCommonAnswer: 'Самый частый ответ',
        NumberOfUniqueAnswers: 'Количество уникальных ответов',
        TrueCount: 'Количество "Да"',
        FalseCount: 'Количество "Нет"',
        UserName: 'Имя пользователя',
        FillingDate: 'Время заполнения',
        SubmittedAt: 'Время отправки',
        Actions: 'Действия',
        View: 'Просмотреть',
        Delete: 'Удалить',
        DeletedForm: 'Форма успешно удалена',
        FailedToDeleteForm: 'Не удалось удалить форму',
        SubmittedApplications: 'Заполненные формы',
        Yes: 'Да',
        No: 'Нет',
        FormSubmission: 'Заполнение формы',
        Error: 'Ошибка',
        SignInTo: 'Войдите',
        ToSubmitForm: 'что бы заполнить форму',
        NoPermissionToFillForm: 'У вас нет разрешения на заполнение этой формы',
        Submit: 'Отправить',
        FormSubmitted: 'Форма была заполнена',
        SignIn: 'Войти',
        SignUp: 'Зарегистрироваться',
        Profile: 'Профиль',
        Forms: 'Формы',
        QuestionTitle: 'Название вопроса',
        QuestionDescription: 'Описание вопроса',
        Options: 'Опции',
        Add: 'Добавить',
        DisplayInTable: 'Отображать в таблице',
        SingleLine: "Однострочный текст",
        MultiLine: "Многосточный текст",
        Integer: "Число",
        Checkbox: "Да/Нет",
        Select: "Выбор",
        UniqueAnswers: "Уникальные ответы",
        SelectTopic: "Выбор топика",
        Users: "Пользователи",
        TemplateName: "Название шаблона",
        LatestTemplates: "Новые шаблоны",
        NoTemplatesAvailable: "Нет шаблонов на данный момент",
        PopularTemplates: "Популярные шаблоны",
        NoTagsAvailable: "Нет тэгов на данный момент",
        ExploreTags: "Исследуйте тэги",
        CompleteLogin: "Пожалуйста завершите авторизацию",
        DontHaveAccount: "Еще нет аккаунта?",
        OrContinueWith: "Или используйте",
        ForgotPassword: "Забыли пароль?",
        Password: "Пароль",
        Email: "Email",
        EnterYourEmail: "Введите email и пароль для входа в аккаунт",
        SignUpTo: "Зарегистрируйтесь",
        AlreadyHaveAccount: "Уже есть аккаунт?",
        CreateAccount: "Зарегистрироваться",
        CreateAnAccount: "Создайте аккаунт",
        SignUpPage: "Регистрация",
        SignInPage: "Авторизация",
        BackToLogin: "Назад к авторизации",
        ResendConfirmation: "Отправить повторно",
        CheckSpam: "Если вы не видите письмо, пожалуйста, проверьте папку со спамом.",
        VerificationSent: " Мы отправили письмо с подтверждением на ваш зарегистрированный адрес электронной почты.\n" +
            "                        Пожалуйста, проверьте свой почтовый ящик и нажмите ссылку подтверждения, чтобы активировать свою учетную запись.",
        CheckEmail: "Пожалуйста, проверьте свою электронную почту, чтобы подтвердить свою учетную запись",
        ConfirmYourEmail: "Подтвердите свой Email",
        SuccessfulExternalLogin: "Успешный вход через внешний сервис",
        ExternalLoginFailed: "Вход через внешний сервия не удался",
        NoTagsFound: "Отсутствуют тэги",
        NoTemplatesFound: "Отсутствуют шаблоны",
        TemplateGallery: "Галерея шаблонов",
        CreateNewTemplate: "Создать новый шаблон",
        UseTemplate: "Использовать шаблон",
        FillsCount: "Количество заполнений",
        Author: "Автор",
        Name: "Название",
        CreatedAt: "Дата создания",
        Avatar: "Аватар",
        Role: "Роль",
        Status: "Статус",
        Block: "Заблокировать",
        Unblock: "Разблокировать",
        MakeAdmin: "Сделать администратором",
        RemoveAdmin: "Убрать из администраторов",
        UserManagement: "Управление пользователями",
        ConnectSalesforce: "Подключиться к Salesforce",
        Phone: "Телефон",
        Company: "Компания",
        LastName: "Фамилия",
        FirstName: "Имя",
        SalesforceAccountCreationFailed: "Не удалось создать Salesforce аккаунт",
        SalesforceAccountCreated: "Salesforce аккаунт успешно создан",
        SalesforceDisconnected: "Отключена интеграция с Salesforce",
        SalesforceDisconnectionFailed: "Не удалось отключить интеграцию с Salesforce",
        Tickets: "Обращения",
        Integrations: "Интеграции",
        EditProfile: "Редактировать профиль",
        UpdateProfile: "Обновить профиль",
        ChangeAvatar: "Изменить аватар",
        SalesforceIntegrationDescription: "Интеграция с платформой Salesforce",
        SalesforceIntegration: "Salesforce интеграция",
        CreateSalesforceAccountDescription: "Создайте Salesforce аккаунт",
        Connect: "Подключить",
        Disconnect: "Отключить",
        Disconnected: "Подключено",
        Connected: "Отключено",
        ApiToken: "API Токен",
        GenerateApiToken: "Сгенерировать API Токен",
        ApiTokenDescription: "API-токен — это уникальный ключ, который позволяет безопасно интегрировать ваш профиль с внешними платформами.",
        JiraAccountCreated: "Jira аккаунт успешно подключен",
        JiraAccountCreationFailed: "Не удалось подключить Jira аккаунт",
        ConnectJira: "Подключить Jira",
        CreateJiraAccountDescription: "Подключить Jira аккаунт к профилю",
        JiraIntegration: "Jira интеграция",
        JiraDisconnectionFailed: "Не удалось отключить интеграцию с Jira",
        JiraDisconnected: "Отключена интеграция с Jira",
        JiraIntegrationDescription: "Интеграция с платформой Jira для управления обращениями",
        TicketKey: "Номер обращения",
        Priority: "Приоритет",
        OpenInJira: "Открыть в Jira",
        YourTickets: "Обращения",
    }
};

type Key = keyof typeof translations["en"]


export function LanguageProvider(props: { children: JSX.Element }) {
    const [language, setLanguage] = makePersisted(createSignal<Language>(Language.En), {
        name: "language",
        sync: storageSync,
        storage: localStorage
    });
    

    const dict = createMemo(() => i18n.flatten(translations[language()]));

    const translate = i18n.translator(dict);
    
    const t = (key: Key) => {
        return translate(key);
    };

    const changeLanguage = (newLanguage: Language) => {
        setLanguage(newLanguage);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {props.children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext)!;
}