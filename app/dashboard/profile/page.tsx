'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuthStatus } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, User } from "lucide-react";

interface ProfileData {
  id?: string;
  user_id: string;
  full_name: string;
  bio: string;
  location: string;
  website: string;
  expertise_level: string;
  social_links: any;
  phone: string;
  avatar_url?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [expertiseLevel, setExpertiseLevel] = useState('beginner');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log("Profile Page: Loading user data");
        const { authenticated, user: authUser } = await checkAuthStatus();
        
        if (authenticated && authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email
          });
          
          // Fetch profile data
          try {
            console.log("Profile Page: Fetching profile for user ID:", authUser.id);
            const profileResponse = await fetch(`/api/user/profile?userId=${authUser.id}`, {
              credentials: 'include'
            });
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              console.log("Profile Page: Received profile data:", profileData);
              
              if (profileData.profile) {
                const profileInfo = profileData.profile;
                setProfile(profileInfo);
                
                // Set form values
                setFullName(profileInfo.full_name || '');
                setBio(profileInfo.bio || '');
                setLocation(profileInfo.location || '');
                setWebsite(profileInfo.website || '');
                setExpertiseLevel(profileInfo.expertise_level || 'beginner');
                setPhone(profileInfo.phone || '');
              }
            } else {
              const errorData = await profileResponse.json();
              console.error('Profile Page: Failed to load profile data:', errorData);
              setError('Failed to load profile data: ' + (errorData.error || 'Unknown error'));
            }
          } catch (error) {
            console.error('Profile Page: Error fetching profile:', error);
            setError('Error loading profile');
          }
        } else {
          setError('You must be logged in to view this page');
        }
      } catch (error) {
        console.error('Profile Page: Error loading user data:', error);
        setError('Error checking authentication');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log("Profile Page: Saving profile");
      
      const profileData = {
        full_name: fullName,
        bio: bio,
        location: location,
        website: website,
        expertise_level: expertiseLevel,
        phone: phone,
        social_links: profile?.social_links || {}
      };

      console.log("Profile Page: Profile data to save:", profileData);

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      console.log("Profile Page: Save response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Profile Page: Save error:", errorData);
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const result = await response.json();
      console.log("Profile Page: Save success:", result);

      if (result.profile) {
        setProfile(result.profile);
      }

      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });

    } catch (error) {
      console.error("Profile Page: Save error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
          <p className="text-destructive">{error || 'You must be logged in to view this page.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">Manage your account information and preferences.</p>
      </div>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-border bg-muted flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              
              <div className="space-y-1">
                <Label>Profile Picture</Label>
                <Button type="button" variant="outline" size="sm" disabled>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </Button>
                <p className="text-xs text-muted-foreground">
                  Avatar upload coming soon
                </p>
              </div>
            </div>

            {/* Account Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a little about yourself and your automotive interests..."
                rows={3}
              />
            </div>

            {/* Location and Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State/Province, Country"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(optional)"
                />
              </div>
            </div>

            {/* Website and Expertise */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expertiseLevel">Automotive Experience Level</Label>
                <Select value={expertiseLevel} onValueChange={setExpertiseLevel}>
                  <SelectTrigger id="expertiseLevel">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* User ID (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="text"
                value={user.id}
                disabled
                className="bg-muted font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                This is your unique identifier in the system
              </p>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}