'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Users, DollarSign, Calendar, TrendingUp, BarChart3, PieChart, ArrowRight } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Welcome to the CCC administration dashboard. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <Button className="inline-flex items-center gap-x-2 self-start sm:self-center">
          <span>Generate Report</span>
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Sponsors Card */}
        <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sponsors</CardTitle>
              <div className="rounded-full bg-primary/10 p-2 text-primary dark:bg-primary/20">
                <Users className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-1">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">4</div>
              <span className="inline-flex items-center rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <TrendingUp className="mr-0.5 h-3 w-3" />
                +25%
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Compared to last month</p>
          </CardContent>
          <CardFooter className="border-t pt-4 dark:border-gray-700">
            <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-gray-500 hover:text-primary dark:text-gray-400">
              <span>View all sponsors</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>

        {/* Funds Raised Card */}
        <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Funds Raised</CardTitle>
              <div className="rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-1">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">$50,000</div>
              <span className="inline-flex items-center rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <TrendingUp className="mr-0.5 h-3 w-3" />
                +12%
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Compared to last month</p>
          </CardContent>
          <CardFooter className="border-t pt-4 dark:border-gray-700">
            <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-gray-500 hover:text-primary dark:text-gray-400">
              <span>View all donations</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>

        {/* Days Until Event Card */}
        <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Days Until Event</CardTitle>
              <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">45</div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Event on May 21, 2025</p>
          </CardContent>
          <CardFooter className="border-t pt-4 dark:border-gray-700">
            <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-gray-500 hover:text-primary dark:text-gray-400">
              <span>View event details</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Charts and Additional Content */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-none shadow-md dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</CardTitle>
                <CardDescription className="text-sm text-gray-500 dark:text-gray-400">Latest actions and updates</CardDescription>
              </div>
              <div className="rounded-full bg-gray-100 p-2 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                <BarChart3 className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Activity items */}
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start space-x-3 border-b pb-4 last:border-0 dark:border-gray-700">
                  <div className="rounded-full bg-primary/10 p-2 text-primary dark:bg-primary/20">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">New sponsor added</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Company {item} joined as a Gold sponsor</p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View All Activity
            </Button>
          </CardFooter>
        </Card>

        {/* Sponsorship Breakdown */}
        <Card className="border-none shadow-md dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Sponsorship Breakdown</CardTitle>
                <CardDescription className="text-sm text-gray-500 dark:text-gray-400">Distribution by sponsorship level</CardDescription>
              </div>
              <div className="rounded-full bg-gray-100 p-2 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                <PieChart className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Placeholder for chart - in a real app you'd use a chart library */}
              <div className="flex h-40 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sponsorship Distribution</p>
                  <div className="mt-2 flex justify-center space-x-2">
                    <div className="flex items-center">
                      <div className="mr-1 h-3 w-3 rounded-full bg-primary"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Gold (50%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-1 h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Silver (30%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-1 h-3 w-3 rounded-full bg-gray-300"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Bronze (20%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sponsorship level stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Gold Sponsors</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Silver Sponsors</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Bronze Sponsors</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">1</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View Detailed Report
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
