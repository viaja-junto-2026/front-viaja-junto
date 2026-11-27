import type { RouteObject } from 'react-router'
import { RequireAuth } from '../auth/RequireAuth'
import { AppLayout } from '../layouts/AppLayout'
import ActivityDetailsPage from '../pages/ActivityDetailsPage'
import AuthCallbackPage from '../pages/AuthCallbackPage'
import DestinationDetailsPage from '../pages/DestinationDetailsPage'
import DestinationsPage from '../pages/DestinationsPage'
import ErrorPage from '../pages/ErrorPage'
import HomePage from '../pages/HomePage'
import JoinTripPage from '../pages/JoinTripPage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import NotificationsPage from '../pages/NotificationsPage'
import ProfilePage from '../pages/ProfilePage'
import ReviewsPage from '../pages/ReviewsPage'
import TripCreatePage from '../pages/TripCreatePage'
import TripDetailsPage from '../pages/TripDetailsPage'
import TripEditPage from '../pages/TripEditPage'
import TripsPage from '../pages/TripsPage'
import { paths, patterns } from './paths'

/**
 * Tabela de rotas do app. Login e retorno do login ficam fora do layout principal.
 * Uma rota quebrada mostra o ErrorPage dentro do layout, sem derrubar a navegação.
 */
export const routes: RouteObject[] = [
  { path: paths.login, element: <LoginPage /> },
  { path: paths.authCallback, element: <AuthCallbackPage /> },
  {
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          { path: paths.home, element: <HomePage />, handle: { fullBleed: true, footer: true } },
          { path: paths.destinations, element: <DestinationsPage />, handle: { fullBleed: true } },
          {
            path: patterns.destinationDetails,
            element: <DestinationDetailsPage />,
            handle: { fullBleed: true },
          },
          {
            path: patterns.activityDetails,
            element: <ActivityDetailsPage />,
            handle: { fullBleed: true },
          },
          { path: paths.reviews, element: <ReviewsPage /> },
          // Rotas privadas: sem login, o usuário é levado para /login e volta depois de entrar.
          {
            element: <RequireAuth />,
            children: [
              { path: paths.trips, element: <TripsPage />, handle: { fullBleed: true } },
              { path: paths.tripNew, element: <TripCreatePage />, handle: { fullBleed: true } },
              {
                path: patterns.tripDetails,
                element: <TripDetailsPage />,
                handle: { fullBleed: true },
              },
              { path: patterns.tripEdit, element: <TripEditPage />, handle: { fullBleed: true } },
              { path: paths.join, element: <JoinTripPage /> },
              { path: paths.notifications, element: <NotificationsPage /> },
              { path: paths.profile, element: <ProfilePage /> },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]
